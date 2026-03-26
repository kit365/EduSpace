package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.EkycVerificationService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.common.enums.VerificationStatus;
import com.eduspace.accountservice.model.dto.request.ekyc.EkycCommitRequest;
import com.eduspace.accountservice.infrastructure.client.KycAiClient;
import com.eduspace.accountservice.infrastructure.config.KycAiProperties;
import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse;
import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse.OcrPayload;
import com.eduspace.accountservice.model.entity.EkycVerificationEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.infrastructure.messaging.producer.EkycProducer;
import com.eduspace.accountservice.persistence.repository.EkycVerificationRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EkycVerificationServiceImpl implements EkycVerificationService {

    private final UserRepository userRepository;
    private final EkycVerificationRepository ekycVerificationRepository;
    private final KycAiClient kycAiClient;
    private final KycAiProperties kycAiProperties;
    private final EkycProducer ekycProducer;
    private final ObjectMapper objectMapper;


    @Override
    @Transactional
    public EkycVerifyResponse verify(String keycloakId, String email, MultipartFile front, MultipartFile back,
            MultipartFile selfie) {
        if (front == null || front.isEmpty() || selfie == null || selfie.isEmpty()) {
            throw new AppException(ErrorCode.EKYC_INVALID_DOCUMENTS);
        }

        UserEntity user;
        if (keycloakId != null) {
            user = userRepository.findByKeycloakId(keycloakId)
                    .orElseGet(() -> email != null ? userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)) : null);
        } else {
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

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
            
            log.info("EKYC AI RAW RESPONSES for user {}:\nLiveness: {}\nFace: {}\nOCR: {}", 
                user.getId(), 
                live.toPrettyString(), 
                face.toPrettyString(), 
                ocrJson.toPrettyString());
        } catch (WebClientResponseException | WebClientRequestException e) {
            log.error("EKYC AI Service error", e);
            throw new AppException(ErrorCode.EKYC_AI_UNAVAILABLE);
        }

        boolean livenessPass = evaluateLiveness(live);
        boolean facePass = evaluateFace(face);
        OcrPayload ocrPayload = buildOcrPayload(ocrJson);
        boolean ocrPass = StringUtils.hasText(ocrPayload.idNumber());

        // Enhanced Validations
        String reason = null;
        if (ocrPass) {
            // 1. Uniqueness check
            if (ekycVerificationRepository.existsByIdCardNumberAndStatus(ocrPayload.idNumber(), VerificationStatus.VERIFIED)) {
                reason = "This ID card is already associated with another verified account.";
                ocrPass = false;
            }
            // 2. Name matching
            else if (!isNameMatch(user.getFullName(), ocrPayload.name())) {
                reason = "The name on the ID card does not match your account name.";
                ocrPass = false;
            }
        }

        if (!livenessPass || !facePass || !ocrPass) {
            String finalReason = reason != null ? reason : buildFailureReason(livenessPass, facePass, ocrPass);
            persistVerification(user, VerificationStatus.FAILED, ocrPayload, face, live, livenessPass, facePass, finalReason);
            return new EkycVerifyResponse(
                    "failed",
                    ocrPass ? ocrPayload : null,
                    faceMatchingScore(face),
                    finalReason);
        }

        persistVerification(user, VerificationStatus.VERIFIED, ocrPayload, face, live, true, true, null);
        
        // Cập nhật trạng thái User (SAGA)
        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setIsActive(true);
        userRepository.save(user);

        // Bắn Event sang Kafka
        ekycProducer.sendVerifySuccess(user.getId(), ocrPayload);

        return new EkycVerifyResponse(
                "success",
                ocrPayload,
                faceMatchingScore(face),
                null);
    }

    @Override
    @Transactional
    public EkycVerifyResponse commitFromClient(String keycloakId, String email, EkycCommitRequest req) {
        UserEntity user;
        if (keycloakId != null) {
            user = userRepository.findByKeycloakId(keycloakId)
                    .orElseGet(() -> email != null ? userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)) : null);
        } else {
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        if (Double.isNaN(req.faceDistance()) || req.faceDistance() < 0 || req.faceDistance() > 2.0) {
            throw new AppException(ErrorCode.EKYC_INVALID_DOCUMENTS);
        }

        OcrPayload ocrPayload = req.ocrData() != null
                ? req.ocrData()
                : new OcrPayload(null, null, null, null, null);
        boolean ocrPass = StringUtils.hasText(ocrPayload.idNumber());
        boolean facePass = req.faceDistance() <= kycAiProperties.getFaceDistanceThreshold();

        // 1. Uniqueness check
        String reason = null;
        if (ocrPass) {
            if (ekycVerificationRepository.existsByIdCardNumberAndStatus(ocrPayload.idNumber(), VerificationStatus.VERIFIED)) {
                reason = "This ID card is already associated with another verified account.";
                ocrPass = false;
            }
            // 2. Name matching
            else if (!isNameMatch(user.getFullName(), ocrPayload.name())) {
                reason = "The name on the ID card does not match your account name.";
                ocrPass = false;
            }
        }

        double scoreOut = Math.max(0, Math.min(1, 1.0 - req.faceDistance()));

        if (!facePass || !ocrPass) {
            String finalReason = reason != null ? reason : buildCommitFailureReason(facePass, ocrPass);
            persistVerification(user, VerificationStatus.FAILED, ocrPayload, null, null, null, facePass, finalReason);
            return new EkycVerifyResponse(
                    "failed",
                    ocrPass ? ocrPayload : null,
                    scoreOut,
                    finalReason);
        }

        persistVerification(user, VerificationStatus.VERIFIED, ocrPayload, null, null, null, true, null);
        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setIsActive(true);
        userRepository.save(user);

        // Bắn Event sang Kafka cho đồng bộ
        ekycProducer.sendVerifySuccess(user.getId(), ocrPayload);

        return new EkycVerifyResponse("success", ocrPayload, scoreOut, null);
    }

    private static String buildCommitFailureReason(boolean facePass, boolean ocrPass) {
        if (!facePass) {
            return "Face does not match the portrait on your ID.";
        }
        if (!ocrPass) {
            return "Could not read ID number from the front image. Retake with better focus and lighting.";
        }
        return "Verification failed.";
    }

    private void persistVerification(UserEntity user, VerificationStatus status, OcrPayload ocr, 
            JsonNode face, JsonNode live, Boolean livenessPass, boolean facePass, String reason) {
        
        Double faceDistance = null;
        if (face != null && face.hasNonNull("distance")) {
            faceDistance = face.get("distance").asDouble();
        }
        
        Double livenessScore = null;
        if (live != null && live.hasNonNull("score")) {
            livenessScore = live.get("score").asDouble();
        }

        EkycVerificationEntity e = EkycVerificationEntity.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .status(status)
                .idCardNumber(ocr != null ? ocr.idNumber() : null)
                .legalName(ocr != null ? ocr.name() : null)
                .dob(ocr != null ? parseDob(ocr.dob()) : null)
                .address(ocr != null ? ocr.address() : null)
                .idNumberHash(ocr != null && ocr.idNumber() != null ? sha256Hex(ocr.idNumber()) : null)
                .faceDistance(faceDistance)
                .livenessScore(livenessScore)
                .faceVerified(facePass)
                .livenessPassed(livenessPass)
                .failureReason(reason)
                .build();
        
        ekycVerificationRepository.save(e);
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
        String idNum = textOrNull(fields, "id_number");
        if (idNum == null) {
            idNum = textOrNull(fields, "id_card_number"); // Fallback
        }
        return new OcrPayload(
                textOrNull(fields, "name"),
                idNum,
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


    private LocalDate parseDob(String dobStr) {
        if (!StringUtils.hasText(dobStr)) return null;
        try {
            // Common formats from OCR: DD/MM/YYYY or YYYY-MM-DD
            if (dobStr.contains("/")) {
                return LocalDate.parse(dobStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            }
            return LocalDate.parse(dobStr);
        } catch (Exception e) {
            log.warn("Failed to parse DOB: {}", dobStr);
            return null;
        }
    }

    private boolean isNameMatch(String userFullName, String ocrName) {
        if (!StringUtils.hasText(userFullName) || !StringUtils.hasText(ocrName)) return false;
        
        String normalizedUser = normalizeName(userFullName);
        String normalizedOcr = normalizeName(ocrName);
        
        return normalizedUser.equalsIgnoreCase(normalizedOcr);
    }

    private String normalizeName(String name) {
        return name.toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("đ", "d")
                .replaceAll("\\s+", " ")
                .trim();
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
