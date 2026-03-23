package com.eduspace.conversationservice.persistence.repository;

import com.eduspace.conversationservice.model.entity.ConversationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;

@Repository
public interface ConversationRepository extends JpaRepository<ConversationEntity, String> {

    @Query("SELECT c FROM ConversationEntity c WHERE c.isAdminConversation = :isAdmin AND ((c.user1Id = :u1 AND c.user2Id = :u2) OR (c.user1Id = :u2 AND c.user2Id = :u1))")
    Optional<ConversationEntity> findConversationBetween(@Param("u1") String u1, @Param("u2") String u2, @Param("isAdmin") boolean isAdmin);

    List<ConversationEntity> findByUser1IdOrUser2IdOrderByLastActivityDesc(String user1Id, String user2Id);

    List<ConversationEntity> findByIsAdminConversationTrueAndUser1IdOrUser2IdOrderByLastActivityDesc(String user1Id, String user2Id);

    List<ConversationEntity> findByIsAdminConversationTrueAndUser2IdOrderByLastActivityDesc(String user2Id);

    /** Rows where participant id was wrongly stored as an email (contains '@'). */
    List<ConversationEntity> findByUser1IdContainingOrUser2IdContaining(String user1Fragment, String user2Fragment);

    Optional<ConversationEntity> findBySagaId(String sagaId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE ConversationEntity c SET c.user1Id = :newUserId WHERE c.user1Id = :guestId AND c.isAdminConversation = true")
    int updateUser1IdForGuestSupport(@Param("guestId") String guestId, @Param("newUserId") String newUserId);

    Optional<ConversationEntity> findFirstByUser1IdAndIsAdminConversationTrueOrderByLastActivityDesc(String user1Id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            DELETE FROM conversations c
            WHERE c.is_admin_conversation = true
              AND c.created_at < :cutoff
              AND NOT EXISTS (
                SELECT 1 FROM chat_messages m
                WHERE m.conversation_id = c.conversation_id
                  AND m.message_type IN ('TEXT', 'IMAGE')
              )
            """, nativeQuery = true)
    int deleteStaleEmptyAdminConversations(@Param("cutoff") LocalDateTime cutoff);
}

