package com.eduspace.accountservice.infrastructure.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class KycAiClient {

    private static final Duration BLOCK_TIMEOUT = Duration.ofSeconds(120);

    private final @Qualifier("kycAiWebClient") WebClient kycAiWebClient;
    private final ObjectMapper objectMapper;

    public JsonNode liveness(byte[] selfieBytes) {
        MultipartBodyBuilder mb = new MultipartBodyBuilder();
        mb.part("selfie", new ByteArrayResource(selfieBytes) {
            @Override
            public String getFilename() {
                return "selfie.jpg";
            }
        }).contentType(MediaType.IMAGE_JPEG);
        String body = postMultipart("/internal/v1/liveness", mb);
        return readTree(body);
    }

    public JsonNode faceVerify(byte[] selfieBytes, byte[] idFrontBytes) {
        MultipartBodyBuilder mb = new MultipartBodyBuilder();
        mb.part("selfie", new ByteArrayResource(selfieBytes) {
            @Override
            public String getFilename() {
                return "selfie.jpg";
            }
        }).contentType(MediaType.IMAGE_JPEG);
        mb.part("id_front", new ByteArrayResource(idFrontBytes) {
            @Override
            public String getFilename() {
                return "id_front.jpg";
            }
        }).contentType(MediaType.IMAGE_JPEG);
        String body = postMultipart("/internal/v1/face/verify", mb);
        return readTree(body);
    }

    public JsonNode ocr(byte[] frontBytes, byte[] backBytes) {
        MultipartBodyBuilder mb = new MultipartBodyBuilder();
        mb.part("front", new ByteArrayResource(frontBytes) {
            @Override
            public String getFilename() {
                return "front.jpg";
            }
        }).contentType(MediaType.IMAGE_JPEG);
        if (backBytes != null && backBytes.length > 0) {
            mb.part("back", new ByteArrayResource(backBytes) {
                @Override
                public String getFilename() {
                    return "back.jpg";
                }
            }).contentType(MediaType.IMAGE_JPEG);
        }
        String body = postMultipart("/internal/v1/ocr/id-card", mb);
        return readTree(body);
    }

    private String postMultipart(String uri, MultipartBodyBuilder mb) {
        try {
            return kycAiWebClient.post()
                    .uri(uri)
                    .body(BodyInserters.fromMultipartData(mb.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(BLOCK_TIMEOUT);
        } catch (WebClientResponseException e) {
            throw e;
        }
    }

    private JsonNode readTree(String body) {
        try {
            return objectMapper.readTree(body);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Invalid JSON from eduspace-ai service", e);
        }
    }
}
