package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.model.dto.request.user.UpdateProfileRequest;
import com.eduspace.accountservice.model.mapper.UserMapper;
import com.eduspace.accountservice.business.service.EkycVerificationService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.infrastructure.client.KycAiClient;
import com.eduspace.accountservice.infrastructure.config.KycAiProperties;
import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse;
import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse.OcrPayload;
import com.eduspace.accountservice.model.entity.EkycVerificationEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.persistence.repository.EkycVerificationRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EkycVerificationServiceImpl implements EkycVerificationService {

    private static final String STATUS_VERIFIED = "VERIFIED";
    private static final String STATUS_FAILED = "FAILED";

    private final UserRepository userRepository;
    private final EkycVerificationRepository ekycVerificationRepository;
    private final KycAiClient kycAiClient;
    private final KycAiProperties kycAiProperties;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public EkycVerifyResponse verify(String keycloakId, 
                                     String fullName, String dob, String phone, String address,
                                     MultipartFile front, MultipartFile back, MultipartFile selfie) {
        if (front == null || front.isEmpty() || selfie == null || selfie.isEmpty()) {
            throw new AppException(ErrorCode.EKYC_INVALID_DOCUMENTS);
        }

        UserEntity user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        byte[] frontBytes = readBytes(front);
        byte[] selfieBytes = readBytes(selfie);
        byte[] backBytes = (back != null && !back.isEmpty()) ? readBytes(back) : null;

        JsonNode live;
        JsonNode face;
        JsonNode ocrJson;
        try {
            live = kycAiClient.liveness(selfieBytes);
            face = kycAiClient.faceVerify(selfieBytes, frontBytes);
            ocrJson = kycAiClient.ocr(frontBytes, backBytes);
        } catch (WebClientResponseException | WebClientRequestException e) {
            throw new AppException(ErrorCode.EKYC_AI_UNAVAILABLE);
        }

        boolean livenessPass = evaluateLiveness(live);
        boolean facePass = evaluateFace(face);
        OcrPayload ocrPayload = buildOcrPayload(ocrJson);
        boolean ocrPass = StringUtils.hasText(ocrPayload.idNumber());

        if (!livenessPass || !facePass || !ocrPass) {
            String reason = buildFailureReason(livenessPass, facePass, ocrPass);
            persistFailure(user.getId(), fullName, dob, phone, address, face, live, livenessPass, facePass, reason);
            return new EkycVerifyResponse(
                    "failed",
                    ocrPass ? ocrPayload : null,
                    faceMatchingScore(face),
                    reason);
        }

        String idHash = sha256Hex(ocrPayload.idNumber());
        if (ekycVerificationRepository.existsByIdNumberHashAndStatus(idHash, STATUS_VERIFIED)) {
            // Check if it belongs to the same user or different
            Optional<EkycVerificationEntity> existing = ekycVerificationRepository.findAll().stream()
                    .filter(e -> e.getIdNumberHash().equals(idHash) && STATUS_VERIFIED.equals(e.getStatus()))
                    .findFirst();
            if (existing.isPresent() && !existing.get().getUserId().equals(user.getId())) {
                throw new AppException(ErrorCode.EKYC_DUPLICATE_ID);
            }
        }

        // Use Mapper for Supplemental & Overwrite Logic
        UpdateProfileRequest updateReq = new UpdateProfileRequest();
        updateReq.setFullName(ocrPayload.name());
        updateReq.setDateOfBirth(ocrPayload.dob());
        updateReq.setStreetAddress(ocrPayload.address());
        updateReq.setPhoneNumber(phone);

        userMapper.updateUserEntityFromRequest(updateReq, user);

        persistSuccess(user.getId(), idHash, fullName, dob, phone, address, face, live, ocrPayload);
        user.setVerificationStatus(STATUS_VERIFIED);
        userRepository.save(user);

        return new EkycVerifyResponse(
                "success",
                ocrPayload,
                faceMatchingScore(face),
                null);
    }

    private static byte[] readBytes(MultipartFile f) {
        try {
            return f.getBytes();
        } catch (Exception e) {
            throw new AppException(ErrorCode.EKYC_INVALID_DOCUMENTS);
        }
    }

    private boolean evaluateLiveness(JsonNode live) {
        boolean isLive = live.path("is_live").asBoolean(false);
        double score = live.path("score").asDouble(0);
        return isLive && score >= kycAiProperties.getLivenessMinScore();
    }

    private boolean evaluateFace(JsonNode face) {
        boolean verified = face.path("verified").asBoolean(false);
        double distance = face.path("distance").asDouble(1.0);
        return verified && distance <= kycAiProperties.getFaceDistanceThreshold();
    }

    private static double faceMatchingScore(JsonNode face) {
        double distance = face.path("distance").asDouble(1.0);
        return Math.max(0, Math.min(1, 1.0 - distance));
    }

    private static OcrPayload buildOcrPayload(JsonNode root) {
        JsonNode fields = root.path("front").path("fields");
        return new OcrPayload(
                textOrNull(fields, "name"),
                textOrNull(fields, "id_number"),
                textOrNull(fields, "dob"),
                textOrNull(fields, "address"),
                textOrNull(fields, "expiry_date"));
    }

    private static String textOrNull(JsonNode n, String field) {
        if (n == null || !n.has(field) || n.get(field).isNull()) {
            return null;
        }
        String s = n.get(field).asText();
        return StringUtils.hasText(s) ? s.trim() : null;
    }

    private static String buildFailureReason(boolean livenessPass, boolean facePass, boolean ocrPass) {
        if (!livenessPass) {
            return "Liveness check did not pass. Use a clear live selfie with good lighting.";
        }
        if (!facePass) {
            return "Face does not match the portrait on your ID.";
        }
        if (!ocrPass) {
            return "Could not read ID number from the front image. Retake with better focus and lighting.";
        }
        return "Verification failed.";
    }

    private void persistFailure(String userId, String providedName, String providedDob, String providedPhone, String providedAddress,
                                JsonNode face, JsonNode live, boolean livenessPass,
                                boolean facePass, String reason) {
        EkycVerificationEntity e = EkycVerificationEntity.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .status(STATUS_FAILED)
                .providedName(providedName)
                .providedDob(providedDob)
                .providedPhone(providedPhone)
                .providedAddress(providedAddress)
                .faceDistance(face.hasNonNull("distance") ? face.get("distance").asDouble() : null)
                .livenessScore(live.hasNonNull("score") ? live.get("score").asDouble() : null)
                .faceVerified(facePass)
                .livenessPassed(livenessPass)
                .failureReason(reason)
                .build();
        ekycVerificationRepository.save(e);
    }

    private void persistSuccess(String userId, String idNumberHash, 
                                String providedName, String providedDob, String providedPhone, String providedAddress,
                                JsonNode face, JsonNode live, OcrPayload ocr) {
        EkycVerificationEntity e = EkycVerificationEntity.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .status(STATUS_VERIFIED)
                .idNumberHash(idNumberHash)
                .providedName(providedName)
                .providedDob(providedDob)
                .providedPhone(providedPhone)
                .providedAddress(providedAddress)
                .faceDistance(face.hasNonNull("distance") ? face.get("distance").asDouble() : null)
                .livenessScore(live.hasNonNull("score") ? live.get("score").asDouble() : null)
                .faceVerified(true)
                .livenessPassed(true)
                .failureReason(null)
                .ocrName(ocr.name())
                .ocrIdNumber(ocr.idNumber())
                .ocrDob(ocr.dob())
                .ocrAddress(ocr.address())
                .build();
        ekycVerificationRepository.save(e);
    }

    @Override
    public Optional<OcrPayload> getLatestVerifiedOcrData(String userId) {
        return ekycVerificationRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, STATUS_VERIFIED)
                .map(e -> new OcrPayload(
                        e.getOcrName(),
                        e.getOcrIdNumber(),
                        e.getOcrDob(),
                        e.getOcrAddress(),
                        null // expiry date not used in contract for now
                ));
    }

    private static String sha256Hex(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
