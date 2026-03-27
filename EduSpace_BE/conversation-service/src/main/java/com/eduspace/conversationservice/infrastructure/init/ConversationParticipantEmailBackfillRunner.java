package com.eduspace.conversationservice.infrastructure.init;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Runs {@link ConversationParticipantEmailBackfillService} once at startup when enabled.
 * Separate DBs for account vs conversation — SQL JOIN is not possible; resolution uses Feign.
 */
@Component
@ConditionalOnProperty(name = "app.chat.backfill-email-participants-on-startup", havingValue = "true")
@Order(100)
public class ConversationParticipantEmailBackfillRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(ConversationParticipantEmailBackfillRunner.class);

    private final ConversationParticipantEmailBackfillService backfillService;

    public ConversationParticipantEmailBackfillRunner(ConversationParticipantEmailBackfillService backfillService) {
        this.backfillService = backfillService;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.warn(
                "app.chat.backfill-email-participants-on-startup=true — running email→Keycloak participant backfill. "
                        + "Set to false after a successful run.");
        backfillService.runBackfill();
    }
}
