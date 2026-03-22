package com.eduspace.conversationservice.infrastructure.init;

import com.eduspace.conversationservice.infrastructure.client.AccountClient;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import com.eduspace.conversationservice.model.entity.ChatMessageEntity;
import com.eduspace.conversationservice.model.entity.ConversationEntity;
import com.eduspace.conversationservice.persistence.repository.ChatMessageRepository;
import com.eduspace.conversationservice.persistence.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Fixes legacy rows where {@code user1_id}, {@code user2_id}, or {@code sender_id} stored an email instead of
 * Keycloak id (account DB is separate; resolution is via account-service batch API).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationParticipantEmailBackfillService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AccountClient accountClient;

    @Transactional
    public int runBackfill() {
        List<ConversationEntity> convs = conversationRepository.findByUser1IdContainingOrUser2IdContaining("@", "@");
        Set<String> emailKeys = new LinkedHashSet<>();
        for (ConversationEntity c : convs) {
            addIfEmail(c.getUser1Id(), emailKeys);
            addIfEmail(c.getUser2Id(), emailKeys);
        }
        for (ChatMessageEntity m : chatMessageRepository.findBySenderIdContaining("@")) {
            addIfEmail(m.getSenderId(), emailKeys);
        }
        if (emailKeys.isEmpty()) {
            log.info("Email participant backfill: no @ identifiers found");
            return 0;
        }

        ApiResponse<List<AccountClient.PublicUserProfile>> res;
        try {
            res = accountClient.getPublicProfilesByIdentifiers(new AccountClient.BatchRequest(new ArrayList<>(emailKeys)));
        } catch (Exception e) {
            log.error("Email backfill: account batch failed", e);
            return 0;
        }
        if (res == null || !res.success() || res.data() == null) {
            log.warn("Email backfill: empty or unsuccessful batch response");
            return 0;
        }

        Map<String, String> emailToKeycloak = new HashMap<>();
        for (AccountClient.PublicUserProfile p : res.data()) {
            if (p.keycloakId() == null) {
                continue;
            }
            if (p.email() != null && !p.email().isBlank()) {
                emailToKeycloak.put(p.email().trim().toLowerCase(Locale.ROOT), p.keycloakId());
            }
        }

        int touched = 0;
        for (ConversationEntity c : convs) {
            boolean changed = false;
            String u1 = mapParticipant(c.getUser1Id(), emailToKeycloak);
            String u2 = mapParticipant(c.getUser2Id(), emailToKeycloak);
            if (!Objects.equals(u1, c.getUser1Id())) {
                c.setUser1Id(u1);
                changed = true;
            }
            if (!Objects.equals(u2, c.getUser2Id())) {
                c.setUser2Id(u2);
                changed = true;
            }
            if (changed) {
                conversationRepository.save(c);
                touched++;
            }
        }

        List<ChatMessageEntity> badSenders = chatMessageRepository.findBySenderIdContaining("@");
        for (ChatMessageEntity m : badSenders) {
            String ns = mapParticipant(m.getSenderId(), emailToKeycloak);
            if (!Objects.equals(ns, m.getSenderId())) {
                m.setSenderId(ns);
                chatMessageRepository.save(m);
                touched++;
            }
        }

        log.info("Email participant backfill: updated {} conversation/message records", touched);
        return touched;
    }

    private static void addIfEmail(String id, Set<String> out) {
        if (id != null && id.contains("@") && !id.startsWith("GUEST-")) {
            out.add(id.trim());
        }
    }

    private static String mapParticipant(String id, Map<String, String> emailToKeycloak) {
        if (id == null || !id.contains("@") || id.startsWith("GUEST-")) {
            return id;
        }
        String k = id.trim().toLowerCase(Locale.ROOT);
        return emailToKeycloak.getOrDefault(k, id);
    }
}
