package com.eduspace.conversationservice.infrastructure.scheduler;

import com.eduspace.conversationservice.business.service.ChatService;
import com.eduspace.conversationservice.business.service.SagaService;
import com.eduspace.conversationservice.model.entity.StaffAssignmentOfferEntity;
import com.eduspace.conversationservice.persistence.repository.StaffAssignmentOfferRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class StaffAssignmentOfferExpiryJob {
    private static final Logger log = LoggerFactory.getLogger(StaffAssignmentOfferExpiryJob.class);

    private final StaffAssignmentOfferRepository offerRepository;
    private final SagaService sagaService;
    private final ChatService chatService;

    public StaffAssignmentOfferExpiryJob(
            StaffAssignmentOfferRepository offerRepository,
            SagaService sagaService,
            ChatService chatService) {
        this.offerRepository = offerRepository;
        this.sagaService = sagaService;
        this.chatService = chatService;
    }

    @Scheduled(fixedDelayString = "${app.support.offer-expiry-check-ms:5000}")
    @Transactional
    public void expirePendingOffers() {
        List<StaffAssignmentOfferEntity> expired = offerRepository
                .findByStatusAndExpiresAtBefore(StaffAssignmentOfferEntity.Status.PENDING, LocalDateTime.now());
        for (StaffAssignmentOfferEntity offer : expired) {
            offer.setStatus(StaffAssignmentOfferEntity.Status.EXPIRED);
            offerRepository.save(offer);
            sagaService.failSaga(offer.getSagaId(), "Offer expired without admin acceptance");
            chatService.notifyStaffAssignmentFailed(offer.getConversationId(), "No admin accepted the assignment offer");
            log.info("Expired assignment offer {} for conversation {}", offer.getId(), offer.getConversationId());
        }
    }
}
