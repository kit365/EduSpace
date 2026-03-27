package com.eduspace.conversationservice.infrastructure.persistence.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Converter
public class JsonMapConverter implements AttributeConverter<Map<String, List<String>>, String> {
    private static final Logger log = LoggerFactory.getLogger(JsonMapConverter.class);

    private final static ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, List<String>> attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            log.error("Could not convert map to JSON string", e);
            return null;
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, List<String>> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(dbData, Map.class);
        } catch (IOException e) {
            log.error("Could not convert JSON string to map", e);
            return new HashMap<>();
        }
    }
}
