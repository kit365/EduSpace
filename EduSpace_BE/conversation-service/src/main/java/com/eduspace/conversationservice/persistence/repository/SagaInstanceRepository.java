package com.eduspace.conversationservice.persistence.repository;

import com.eduspace.conversationservice.model.entity.SagaInstanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SagaInstanceRepository extends JpaRepository<SagaInstanceEntity, String> {
}

