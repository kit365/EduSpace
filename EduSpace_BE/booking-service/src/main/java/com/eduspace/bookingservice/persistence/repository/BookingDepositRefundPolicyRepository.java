package com.eduspace.bookingservice.persistence.repository;

import com.eduspace.bookingservice.model.entity.BookingDepositRefundPolicyEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingDepositRefundPolicyRepository extends JpaRepository<BookingDepositRefundPolicyEntity, Long> {

    List<BookingDepositRefundPolicyEntity> findAllByDeletedFalseOrderByIdAsc();
}
