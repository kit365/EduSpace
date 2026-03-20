package com.eduspace.conversationservice.persistence.repository;

import com.eduspace.conversationservice.model.entity.ConversationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<ConversationEntity, String> {

    @Query("""
            select c from ConversationEntity c
            where c.isAdminConversation = :isAdmin
              and (
                    (c.user1Id = :user1 and c.user2Id = :user2)
                 or (c.user1Id = :user2 and c.user2Id = :user1)
              )
            """)
    Optional<ConversationEntity> findBetweenUsers(
            @Param("user1") String user1,
            @Param("user2") String user2,
            @Param("isAdmin") boolean isAdminConversation
    );

    @Query("""
            select c from ConversationEntity c
            where (c.user1Id = :userId or c.user2Id = :userId)
            order by c.lastActivity desc
            """)
    List<ConversationEntity> findUserConversations(@Param("userId") String userId);

    @Query("""
            select c from ConversationEntity c
            where c.isAdminConversation = true
              and (c.user1Id = :userId or c.user2Id = :userId)
            order by c.lastActivity desc
            """)
    List<ConversationEntity> findAdminConversations(@Param("userId") String userId);
}

