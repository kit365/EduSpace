package com.eduspace.bookingservice.persistence.repository;

import com.eduspace.bookingservice.model.entity.VoucherEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<VoucherEntity, Long> {

    Optional<VoucherEntity> findByCodeAndIsDeletedFalse(String code);

    /** Lấy tất cả voucher public còn hiệu lực (cho user xem). */
    @Query("""
            SELECT v FROM VoucherEntity v
            WHERE v.isPublic = true
              AND v.isActive = true
              AND v.isDeleted = false
              AND v.validFrom <= :now
              AND v.validUntil >= :now
            ORDER BY v.validUntil ASC
            """)
    List<VoucherEntity> findAllPublicAndValid(@Param("now") LocalDateTime now);

    /** Admin: lấy tất cả (kể cả đã xoá). */
    @Query("""
            SELECT v FROM VoucherEntity v
            WHERE (:campaignId IS NULL OR v.campaignId = :campaignId)
            ORDER BY v.createdAt DESC
            """)
    List<VoucherEntity> findAllByCampaign(@Param("campaignId") Long campaignId);

    boolean existsByCodeAndIsDeletedFalse(String code);
}
