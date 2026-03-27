package com.eduspace.conversationservice.infrastructure.scheduler;

import com.eduspace.conversationservice.persistence.repository.ConversationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Removes admin support conversations that were never meaningfully used (no TEXT/IMAGE from users)
 * and are older than 24h — reduces DB noise from abandoned guest tabs.
 */
@Component
public class EmptyAdminConversationCleanupJob {
    private static final Logger log = LoggerFactory.getLogger(EmptyAdminConversationCleanupJob.class);

    private final ConversationRepository conversationRepository;

    public EmptyAdminConversationCleanupJob(ConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    @Scheduled(cron = "0 0 2 * * *", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void purgeStaleEmptySupportRooms() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        int deleted = conversationRepository.deleteStaleEmptyAdminConversations(cutoff);
        if (deleted > 0) {
            log.info("Purged {} stale empty admin support conversations (created before {})", deleted, cutoff);
        }
    }
}
