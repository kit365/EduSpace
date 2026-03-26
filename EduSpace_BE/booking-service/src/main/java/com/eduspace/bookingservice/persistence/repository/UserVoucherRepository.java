package com.eduspace.bookingservice.persistence.repository;

import com.eduspace.bookingservice.model.entity.UserVoucherEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucherEntity, Long> {

    boolean existsByUserIdAndVoucherId(String userId, Long voucherId);

    Optional<UserVoucherEntity> findByUserIdAndVoucherId(String userId, Long voucherId);

    List<UserVoucherEntity> findAllByUserIdOrderByClaimedAtDesc(String userId);

    /** Đếm số lần user đã dùng voucher này (qua is_used flag). */
    long countByUserIdAndVoucherIdAndIsUsedTrue(String userId, Long voucherId);
}
