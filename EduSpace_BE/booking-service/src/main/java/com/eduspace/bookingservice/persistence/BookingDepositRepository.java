package com.eduspace.bookingservice.persistence;

import com.eduspace.bookingservice.domain.entity.BookingDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingDepositRepository extends JpaRepository<BookingDeposit, Long> {

    Optional<BookingDeposit> findFirstByPayosOrderCode(Long payosOrderCode);

    List<BookingDeposit> findByBookingId(Long bookingId);
}
