package com.eduspace.bookingservice.persistence.repository;

import com.eduspace.bookingservice.common.enums.BookingStatus;
import com.eduspace.bookingservice.model.entity.BookingEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    Optional<BookingEntity> findByBookingCode(String bookingCode);

    @Query("""
            SELECT COUNT(b) > 0
            FROM BookingEntity b
            WHERE b.roomId = :roomId
              AND b.bookingDate = :bookingDate
              AND b.status <> :cancelledStatus
              AND b.startDateTime IS NOT NULL
              AND b.endDateTime IS NOT NULL
              AND b.startDateTime < :endDateTime
              AND b.endDateTime > :startDateTime
            """)
    boolean existsOverlap(
            @Param("roomId") Long roomId,
            @Param("bookingDate") java.time.LocalDate bookingDate,
            @Param("startDateTime") java.time.LocalDateTime startDateTime,
            @Param("endDateTime") java.time.LocalDateTime endDateTime,
            @Param("cancelledStatus") BookingStatus cancelledStatus);
}
