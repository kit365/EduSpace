package com.eduspace.conversationservice;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@OpenAPIDefinition(servers = {@Server(url = "/", description = "Gateway Server")})
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableScheduling
public class ConversationServiceApplication {

    public static void main(String[] args) {
        // Load .env from parent directory (EduSpace_BE)
        Dotenv dotenv = Dotenv.configure()
                .directory("../")
                .ignoreIfMissing()
                .load();
        
        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        SpringApplication.run(ConversationServiceApplication.class, args);
    }
}

