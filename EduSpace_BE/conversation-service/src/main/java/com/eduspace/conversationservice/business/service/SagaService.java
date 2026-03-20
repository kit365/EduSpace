package com.eduspace.conversationservice.business.service;

import com.eduspace.conversationservice.model.entity.SagaInstanceEntity;

public interface SagaService {
    SagaInstanceEntity startSaga(String sagaType, String currentStep, Object payload);

    void completeSaga(String sagaId);

    void failSaga(String sagaId, String errorMessage);
}

