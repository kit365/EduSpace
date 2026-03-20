package com.eduspace.conversationservice.persistence.repository;

import com.eduspace.conversationservice.model.entity.ChatMessageEntity;
import com.eduspace.conversationservice.model.entity.ConversationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, String> {

    Page<ChatMessageEntity> findByConversationAndIsDeletedFalseOrderBySentAtDesc(
            ConversationEntity conversation,
            Pageable pageable
    );

    @Query("""
            select m from ChatMessageEntity m
            where m.conversation = :conversation
              and m.isDeleted = false
            order by m.sentAt desc
            """)
    List<ChatMessageEntity> findLatestMessages(@Param("conversation") ConversationEntity conversation, Pageable pageable);

    @Query("""
            select count(m) from ChatMessageEntity m
            where m.conversation = :conversation
              and m.isDeleted = false
              and m.isRead = false
              and m.senderId <> :userId
            """)
    int countUnreadMessages(@Param("conversation") ConversationEntity conversation, @Param("userId") String userId);

    @Modifying
    @Query("""
            update ChatMessageEntity m
            set m.isRead = true,
                m.readAt = :readAt
            where m.conversation = :conversation
              and m.isDeleted = false
              and m.isRead = false
              and m.senderId <> :readerId
            """)
    int markMessagesAsRead(
            @Param("conversation") ConversationEntity conversation,
            @Param("readerId") String readerId,
            @Param("readAt") LocalDateTime readAt
    );
}

