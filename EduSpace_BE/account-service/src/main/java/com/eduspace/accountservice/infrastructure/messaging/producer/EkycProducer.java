package com.eduspace.accountservice.infrastructure.messaging.producer;

import com.eduspace.accountservice.infrastructure.config.messaging.KafkaProperties;
import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse.OcrPayload;
import com.eduspace.accountservice.model.event.BaseEvent;
import com.eduspace.accountservice.model.event.SagaEventConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class EkycProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final KafkaProperties kafkaProperties;

    public void sendVerifySuccess(String userId, OcrPayload ocrPayload) {
        String sagaId = UUID.randomUUID().toString();
        BaseEvent<OcrPayload> event = BaseEvent.<OcrPayload>builder()
                .sagaId(sagaId)
                .eventType(SagaEventConstants.EKYC_VERIFICATION_SUCCESS)
                .timestamp(LocalDateTime.now())
                .payload(ocrPayload)
                .build();

        log.info("Sending EKYC Success Event for User: {}, Saga: {}", userId, sagaId);
        kafkaTemplate.send(kafkaProperties.getEkycResult(), userId, event);
    }
}
