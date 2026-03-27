package com.eduspace.bookingservice.persistence.repository;

import com.eduspace.bookingservice.model.entity.SagaInstanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SagaInstanceRepository extends JpaRepository<SagaInstanceEntity, String> {}
