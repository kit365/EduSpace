package com.eduspace.conversationservice.business.serviceimpl;

import com.eduspace.conversationservice.business.service.SagaService;
import com.eduspace.conversationservice.model.entity.SagaInstanceEntity;
import com.eduspace.conversationservice.persistence.repository.SagaInstanceRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SagaServiceImpl implements SagaService {

    private final SagaInstanceRepository sagaInstanceRepository;
    private final ObjectMapper objectMapper;

    public SagaServiceImpl(SagaInstanceRepository sagaInstanceRepository, ObjectMapper objectMapper) {
        this.sagaInstanceRepository = sagaInstanceRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public SagaInstanceEntity startSaga(String sagaType, String currentStep, Object payload) {
        return startSaga(java.util.UUID.randomUUID().toString(), sagaType, currentStep, payload);
    }

    @Override
    @Transactional
    public SagaInstanceEntity startSaga(String sagaId, String sagaType, String currentStep, Object payload) {
        String json = null;
        if (payload != null) {
            try {
                json = objectMapper.writeValueAsString(payload);
            } catch (JsonProcessingException e) {
                throw new IllegalStateException("Failed to serialize saga payload", e);
            }
        }

        SagaInstanceEntity saga = new SagaInstanceEntity();
        saga.setId(sagaId);
        saga.setSagaType(sagaType);
        saga.setStatus(SagaInstanceEntity.Status.STARTED);
        saga.setCurrentStep(currentStep);
        saga.setPayload(json);
        return sagaInstanceRepository.save(saga);
    }

    @Override
    @Transactional
    public void completeSaga(String sagaId) {
        SagaInstanceEntity saga = sagaInstanceRepository.findById(sagaId)
                .orElseThrow(() -> new IllegalArgumentException("Saga not found"));
        saga.setStatus(SagaInstanceEntity.Status.COMPLETED);
        saga.setCurrentStep(null);
        saga.setCompletedAt(LocalDateTime.now());
        sagaInstanceRepository.save(saga);
    }

    @Override
    @Transactional
    public void failSaga(String sagaId, String errorMessage) {
        SagaInstanceEntity saga = sagaInstanceRepository.findById(sagaId)
                .orElseThrow(() -> new IllegalArgumentException("Saga not found"));
        saga.setStatus(SagaInstanceEntity.Status.FAILED);
        saga.setCurrentStep("FAILED");
        saga.setCompletedAt(LocalDateTime.now());
        if (errorMessage != null && !errorMessage.isBlank()) {
            saga.setPayload(errorMessage);
        }
        sagaInstanceRepository.save(saga);
    }
}

