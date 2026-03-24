package com.eduspace.bookingservice.persistence;

import com.eduspace.bookingservice.domain.entity.BookingDepositRefundPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BookingDepositRefundPolicyRepository extends JpaRepository<BookingDepositRefundPolicy, Long> {

    @Query("""
            select p from BookingDepositRefundPolicy p
            where p.deleted = false
            order by p.displayOrder asc, p.id asc
            """)
    List<BookingDepositRefundPolicy> findAllNotDeletedOrderByDisplayOrder();

    @Query("""
            select p from BookingDepositRefundPolicy p
            where p.deleted = false and p.active = true and p.isDefault = true
            order by p.displayOrder asc, p.id asc
            """)
    Optional<BookingDepositRefundPolicy> findDefaultActivePolicy();

    @Query("""
            select p from BookingDepositRefundPolicy p
            where p.deleted = false and p.active = true
            order by p.displayOrder asc, p.id asc
            """)
    List<BookingDepositRefundPolicy> findAllActiveNotDeleted();
}
