package com.eduspace.bookingservice.persistence;

import com.eduspace.bookingservice.domain.entity.BookingRefund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRefundRepository extends JpaRepository<BookingRefund, Long> {

    List<BookingRefund> findByBooking_IdOrderByCreatedAtDesc(Long bookingId);
}
