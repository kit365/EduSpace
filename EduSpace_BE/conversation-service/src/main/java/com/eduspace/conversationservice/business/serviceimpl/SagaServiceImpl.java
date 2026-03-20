package com.eduspace.conversationservice.business.serviceimpl;

import com.eduspace.conversationservice.business.service.SagaService;
import com.eduspace.conversationservice.model.entity.SagaInstanceEntity;
import com.eduspace.conversationservice.persistence.repository.SagaInstanceRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SagaServiceImpl implements SagaService {

    private final SagaInstanceRepository sagaInstanceRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public SagaInstanceEntity startSaga(String sagaType, String currentStep, Object payload) {
        String json = null;
        if (payload != null) {
            try {
                json = objectMapper.writeValueAsString(payload);
            } catch (JsonProcessingException e) {
                throw new IllegalStateException("Failed to serialize saga payload", e);
            }
        }

        SagaInstanceEntity saga = SagaInstanceEntity.builder()
                .sagaType(sagaType)
                .status(SagaInstanceEntity.Status.STARTED)
                .currentStep(currentStep)
                .payload(json)
                .build();
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

