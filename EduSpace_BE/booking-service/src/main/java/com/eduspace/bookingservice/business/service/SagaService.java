package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.entity.SagaInstanceEntity;

public interface SagaService {

    SagaInstanceEntity startSaga(String sagaId, String sagaType, String currentStep, Object payload);

    void completeSaga(String sagaId);

    void failSaga(String sagaId, String errorMessage);
}
