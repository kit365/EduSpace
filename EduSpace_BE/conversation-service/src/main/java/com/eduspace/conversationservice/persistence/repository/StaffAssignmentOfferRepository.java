package com.eduspace.conversationservice.persistence.repository;

import com.eduspace.conversationservice.model.entity.StaffAssignmentOfferEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StaffAssignmentOfferRepository extends JpaRepository<StaffAssignmentOfferEntity, String> {
    Optional<StaffAssignmentOfferEntity> findByIdAndConversationId(String offerId, String conversationId);
    Optional<StaffAssignmentOfferEntity> findFirstByConversationIdAndStatusOrderByCreatedAtDesc(
            String conversationId,
            StaffAssignmentOfferEntity.Status status);

    List<StaffAssignmentOfferEntity> findByConversationIdAndStatus(String conversationId, StaffAssignmentOfferEntity.Status status);

    List<StaffAssignmentOfferEntity> findByStatusAndExpiresAtBefore(StaffAssignmentOfferEntity.Status status, LocalDateTime time);
}
