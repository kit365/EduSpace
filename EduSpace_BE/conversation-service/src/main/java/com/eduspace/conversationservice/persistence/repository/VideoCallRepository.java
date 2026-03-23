package com.eduspace.conversationservice.persistence.repository;

import com.eduspace.conversationservice.model.entity.VideoCallEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VideoCallRepository extends JpaRepository<VideoCallEntity, String> {

    Optional<VideoCallEntity> findByCallSessionId(String callSessionId);

    @Query("""
            select v from VideoCallEntity v
            where v.conversation.id = :conversationId
            order by v.startedAt desc
            """)
    List<VideoCallEntity> findCallsByConversation(@Param("conversationId") String conversationId);

    @Query("""
            select v from VideoCallEntity v
            where (v.callerId = :userId or v.receiverId = :userId)
              and v.callStatus in ('CONNECTED', 'ACCEPTED')
            """)
    List<VideoCallEntity> findActiveCallsForUser(@Param("userId") String userId);

    @Query("""
            select v from VideoCallEntity v
            where v.callStatus = 'INITIATED' and v.startedAt < :cutoff
            """)
    List<VideoCallEntity> findStaleInitiatedCalls(@Param("cutoff") LocalDateTime cutoff);
}

