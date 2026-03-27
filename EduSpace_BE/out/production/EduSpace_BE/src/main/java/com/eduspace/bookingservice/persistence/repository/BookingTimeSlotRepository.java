package com.eduspace.bookingservice.persistence.repository;

import com.eduspace.bookingservice.model.entity.BookingTimeSlotEntity;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingTimeSlotRepository extends JpaRepository<BookingTimeSlotEntity, Long> {

    List<BookingTimeSlotEntity> findByBookingIdOrderByStartTimeAsc(Long bookingId);

    void deleteByBookingId(Long bookingId);

    @Query("""
        SELECT bts.timeSlotId
        FROM BookingTimeSlotEntity bts
        JOIN BookingEntity b ON b.id = bts.bookingId
        WHERE bts.roomId = :roomId
          AND bts.bookingDate = :bookingDate
          AND b.status <> com.eduspace.bookingservice.common.enums.BookingStatus.CANCELLED
          AND bts.timeSlotId IN :slotIds
        """)
    List<Long> findBookedSlotIds(
            @Param("roomId") Long roomId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("slotIds") Collection<Long> slotIds);

    @Query("""
        SELECT bts.timeSlotId
        FROM BookingTimeSlotEntity bts
        JOIN BookingEntity b ON b.id = bts.bookingId
        WHERE bts.roomId = :roomId
          AND bts.bookingDate = :bookingDate
          AND b.status <> com.eduspace.bookingservice.common.enums.BookingStatus.CANCELLED
        """)
    List<Long> findAllBookedSlotIds(@Param("roomId") Long roomId, @Param("bookingDate") LocalDate bookingDate);
}
