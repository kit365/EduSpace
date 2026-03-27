package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.BankInformationEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BankInformationRepository extends JpaRepository<BankInformationEntity, Long> {

    @Query(
            """
            select b from BankInformationEntity b
            where b.deleted = false and b.userId = :userId
            order by b.defaultAccount desc, b.createdAt desc
            """)
    List<BankInformationEntity> findByUserIdNotDeleted(@Param("userId") String userId);

    @Query(
            """
            select b from BankInformationEntity b
            where b.deleted = false and b.userId = :userId and b.defaultAccount = true
            """)
    Optional<BankInformationEntity> findDefaultByUserId(@Param("userId") String userId);

    @Query(
            """
            select b from BankInformationEntity b
            where b.deleted = false and b.bookingId = :bookingId
            order by b.createdAt desc
            """)
    List<BankInformationEntity> findByBookingIdNotDeleted(@Param("bookingId") Long bookingId);

    @Query(
            """
            select b from BankInformationEntity b
            where b.deleted = false and b.userId is not null
            order by b.verify asc, b.createdAt desc
            """)
    List<BankInformationEntity> findAllUserCreatedNotDeleted();

    @Query(
            """
            select b from BankInformationEntity b
            where b.deleted = false and b.userId is not null and b.verify = :isVerify
            order by b.createdAt desc
            """)
    List<BankInformationEntity> findAllUserCreatedByVerify(@Param("isVerify") boolean isVerify);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
            """
            update BankInformationEntity b
            set b.defaultAccount = false
            where b.userId = :userId and b.deleted = false and b.defaultAccount = true and b.id <> :keepId
            """)
    int unsetOtherDefaults(@Param("userId") String userId, @Param("keepId") Long keepId);

    @Query(
            """
            select b from BankInformationEntity b
            where b.deleted = false and b.accountType = :accountType
            """)
    Optional<BankInformationEntity> findByAccountTypeAndDeletedFalse(@Param("accountType") String accountType);

    @Query(
            """
            select b from BankInformationEntity b
            where b.deleted = false and b.userEmail = :userEmail and b.accountType = :accountType
            order by b.updatedAt desc
            """)
    List<BankInformationEntity> findByUserEmailAndAccountTypeAndDeletedFalseOrderByUpdatedAtDesc(
            @Param("userEmail") String userEmail, @Param("accountType") String accountType);

    @Query(
            """
            select b from BankInformationEntity b
            where b.deleted = false and b.orderId = :orderId
            order by b.updatedAt desc
            """)
    List<BankInformationEntity> findByOrderIdAndDeletedFalseOrderByUpdatedAtDesc(@Param("orderId") String orderId);

    List<BankInformationEntity> findByAccountNumberAndBankCodeAndUserIdAndDeletedFalse(
            String accountNumber, String bankCode, String userId);

    List<BankInformationEntity> findByAccountNumberAndBankCodeAndUserEmailAndDeletedFalse(
            String accountNumber, String bankCode, String userEmail);
}
