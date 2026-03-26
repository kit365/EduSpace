package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.BankInformationService;
import com.eduspace.accountservice.common.enums.banks.VietnamBankEnum;
import com.eduspace.accountservice.infrastructure.client.BookingByCodeSnapshot;
import com.eduspace.accountservice.infrastructure.client.BookingServiceLookupClient;
import com.eduspace.accountservice.model.dto.request.banks.SetDefaultBankInformationRequest;
import com.eduspace.accountservice.model.dto.request.banks.UpsertBankInformationRequest;
import com.eduspace.accountservice.model.dto.request.banks.VerifyBankInformationRequest;
import com.eduspace.accountservice.model.dto.response.banks.BankInformationResponse;
import com.eduspace.accountservice.model.entity.BankInformationEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.persistence.repository.BankInformationRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class BankInformationServiceImpl implements BankInformationService {

    private final BankInformationRepository bankInformationRepository;
    private final UserRepository userRepository;
    private final BookingServiceLookupClient bookingServiceLookupClient;

    @Override
    @Transactional(readOnly = true)
    public List<BankInformationResponse> getMyBanks() {
        String userId = requireUserId();
        return bankInformationRepository.findByUserIdNotDeleted(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BankInformationResponse createMyBank(UpsertBankInformationRequest request) {
        String userId = requireUserId();
        VietnamBankEnum bank = VietnamBankEnum.fromCode(request.bankCode())
                .orElseThrow(() -> new IllegalArgumentException("bankCode không hợp lệ."));

        BankInformationEntity entity = new BankInformationEntity();
        entity.setUserId(userId);
        entity.setBookingId(null);
        entity.setAccountType(BankInformationEntity.ACCOUNT_TYPE_CUSTOMER);
        entity.setAccountNumber(request.accountNumber().trim());
        entity.setAccountHolderName(request.accountHolderName().trim());
        entity.setBankCode(bank.getBankCode());
        entity.setBankName(bank.getBankName());
        entity.setVerify(false);
        entity.setDefaultAccount(false);
        entity.setNote(request.note());
        entity.setActive(true);
        entity.setDeleted(false);

        return toResponse(bankInformationRepository.save(entity));
    }

    @Override
    public BankInformationResponse updateMyBank(Long id, UpsertBankInformationRequest request) {
        String userId = requireUserId();
        BankInformationEntity entity = bankInformationRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bank information."));

        if (entity.getUserId() == null || !entity.getUserId().equals(userId)) {
            throw new AccessDeniedException("Không có quyền chỉnh sửa tài khoản này.");
        }
        if (entity.isDeleted()) {
            throw new IllegalArgumentException("Tài khoản đã bị xóa.");
        }

        VietnamBankEnum bank = VietnamBankEnum.fromCode(request.bankCode())
                .orElseThrow(() -> new IllegalArgumentException("bankCode không hợp lệ."));

        if (!entity.getAccountNumber().equals(request.accountNumber().trim())
                || !entity.getBankCode().equals(bank.getBankCode())) {
            entity.setVerify(false);
        }

        entity.setAccountNumber(request.accountNumber().trim());
        entity.setAccountHolderName(request.accountHolderName().trim());
        entity.setBankCode(bank.getBankCode());
        entity.setBankName(bank.getBankName());
        entity.setNote(request.note());

        return toResponse(bankInformationRepository.save(entity));
    }

    @Override
    public BankInformationResponse setMyDefault(Long bankInfoId, SetDefaultBankInformationRequest request) {
        String userId = requireUserId();
        BankInformationEntity entity = bankInformationRepository
                .findById(bankInfoId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bank information."));
        if (entity.getUserId() == null || !entity.getUserId().equals(userId)) {
            throw new AccessDeniedException("Không có quyền.");
        }
        if (Boolean.TRUE.equals(request.isDefault())) {
            bankInformationRepository.unsetOtherDefaults(userId, entity.getId());
            entity.setDefaultAccount(true);
            entity.setActive(true);
        } else {
            entity.setDefaultAccount(false);
        }
        return toResponse(bankInformationRepository.save(entity));
    }

    @Override
    public BankInformationResponse verifyBank(Long bankInfoId, VerifyBankInformationRequest request) {
        BankInformationEntity entity = bankInformationRepository
                .findById(bankInfoId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bank information."));
        entity.setVerify(Boolean.TRUE.equals(request.isVerify()));
        return toResponse(bankInformationRepository.save(entity));
    }

    @Override
    public BankInformationResponse createGuestBankForBookingCode(
            String bookingCode, UpsertBankInformationRequest request) {
        if (bookingCode == null || bookingCode.isBlank()) {
            throw new IllegalArgumentException("bookingCode là bắt buộc.");
        }
        BookingByCodeSnapshot booking = bookingServiceLookupClient
                .findByBookingCode(bookingCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy booking với mã: " + bookingCode));

        VietnamBankEnum bank = VietnamBankEnum.fromCode(request.bankCode())
                .orElseThrow(() -> new IllegalArgumentException("bankCode không hợp lệ."));

        String userEmail =
                request.userEmail() != null && !request.userEmail().isBlank() ? request.userEmail().trim() : null;
        BankInformationEntity entity = new BankInformationEntity();
        entity.setUserId(null);
        entity.setBookingId(booking.id());
        entity.setAccountType(BankInformationEntity.ACCOUNT_TYPE_GUEST);
        entity.setUserEmail(userEmail);
        entity.setAccountNumber(request.accountNumber().trim());
        entity.setAccountHolderName(request.accountHolderName().trim());
        entity.setBankCode(bank.getBankCode());
        entity.setBankName(bank.getBankName());
        entity.setVerify(false);
        entity.setDefaultAccount(false);
        entity.setNote(request.note());
        entity.setActive(true);
        entity.setDeleted(false);

        return toResponse(bankInformationRepository.save(entity));
    }

    @Override
    public BankInformationResponse createGuestBankForOrderCode(String orderCode, UpsertBankInformationRequest request) {
        if (orderCode == null || orderCode.isBlank()) {
            throw new IllegalArgumentException("orderCode là bắt buộc.");
        }
        throw new IllegalArgumentException("Tính năng đơn hàng (order) chưa được tích hợp trên EduSpace.");
    }

    @Override
    @Transactional(readOnly = true)
    public BankInformationResponse getBankForBookingCode(String bookingCode) {
        if (bookingCode == null || bookingCode.isBlank()) {
            throw new IllegalArgumentException("bookingCode là bắt buộc.");
        }
        BookingByCodeSnapshot booking = bookingServiceLookupClient
                .findByBookingCode(bookingCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy booking với mã: " + bookingCode));

        Optional<BankInformationResponse> byBooking = bankInformationRepository
                .findByBookingIdNotDeleted(booking.id()).stream()
                .findFirst()
                .map(this::toResponse);
        if (byBooking.isPresent()) {
            return byBooking.get();
        }

        if (booking.userId() != null && !booking.userId().isBlank()) {
            Optional<BankInformationResponse> byUserDefault = userRepository
                    .findByKeycloakId(booking.userId())
                    .flatMap(u -> bankInformationRepository.findDefaultByUserId(u.getId()))
                    .map(this::toResponse);
            if (byUserDefault.isPresent()) {
                return byUserDefault.get();
            }
        }

        String guestEmail = booking.guestEmail();
        if (guestEmail != null && !guestEmail.isBlank()) {
            return bankInformationRepository
                    .findByUserEmailAndAccountTypeAndDeletedFalseOrderByUpdatedAtDesc(
                            guestEmail.trim(), BankInformationEntity.ACCOUNT_TYPE_GUEST)
                    .stream()
                    .findFirst()
                    .map(this::toResponse)
                    .orElse(null);
        }
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public BankInformationResponse getBankByGuestEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return bankInformationRepository
                .findByUserEmailAndAccountTypeAndDeletedFalseOrderByUpdatedAtDesc(
                        email.trim(), BankInformationEntity.ACCOUNT_TYPE_GUEST)
                .stream()
                .findFirst()
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public BankInformationResponse getBankForOrderId(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            return null;
        }
        return bankInformationRepository
                .findByOrderIdAndDeletedFalseOrderByUpdatedAtDesc(orderId.trim())
                .stream()
                .findFirst()
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankInformationResponse> getAllForVerify(Boolean verifiedOnly) {
        List<BankInformationEntity> list;
        if (verifiedOnly == null) {
            list = bankInformationRepository.findAllUserCreatedNotDeleted();
        } else {
            list = bankInformationRepository.findAllUserCreatedByVerify(Boolean.TRUE.equals(verifiedOnly));
        }
        return list.stream().map(this::toResponse).toList();
    }

    private String requireUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) {
            throw new AccessDeniedException("Unauthorized");
        }
        return userRepository
                .findByKeycloakId(jwt.getSubject())
                .map(UserEntity::getId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng trong hệ thống."));
    }

    private BankInformationResponse toResponse(BankInformationEntity b) {
        return new BankInformationResponse(
                b.getId(),
                b.getAccountNumber(),
                b.getAccountHolderName(),
                b.getBankCode(),
                b.getBankName(),
                b.isVerify(),
                b.isDefaultAccount(),
                b.getNote(),
                b.getBookingId(),
                b.getOrderId(),
                b.getAccountType(),
                b.getUserId(),
                b.getUserEmail(),
                b.getVietqrImageUrl(),
                b.getCreatedAt(),
                b.getUpdatedAt());
    }
}
