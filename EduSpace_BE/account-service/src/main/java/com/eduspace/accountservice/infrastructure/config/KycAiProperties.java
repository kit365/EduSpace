package com.eduspace.accountservice.infrastructure.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.kyc-ai")
public class KycAiProperties {

    private String baseUrl = "http://localhost:8000";
    private String apiKey = "";
    private double faceDistanceThreshold = 0.55;
    private double livenessMinScore = 0.08;
}
