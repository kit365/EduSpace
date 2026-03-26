package com.eduspace.bookingservice.persistence.repository;

import com.eduspace.bookingservice.model.entity.ExtraBookingAmenityEntity;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExtraBookingAmenityRepository extends JpaRepository<ExtraBookingAmenityEntity, Long> {

    List<ExtraBookingAmenityEntity> findByBookingId(Long bookingId);

    List<ExtraBookingAmenityEntity> findByBookingIdIn(Collection<Long> bookingIds);
}
