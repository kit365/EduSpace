package com.eduspace.bookingservice.persistence.repository;

import com.eduspace.bookingservice.model.entity.VoucherCampaignEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherCampaignRepository extends JpaRepository<VoucherCampaignEntity, Long> {

    List<VoucherCampaignEntity> findAllByIsActiveTrueOrderByStartDateDesc();
}
