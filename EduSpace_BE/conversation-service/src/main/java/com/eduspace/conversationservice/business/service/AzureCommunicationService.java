package com.eduspace.conversationservice.business.service;

import java.util.Map;

public interface AzureCommunicationService {

    Map<String, String> createUserAndToken();

    Map<String, String> refreshUserToken(String userId);

    void revokeUserTokens(String userId);

    void deleteUser(String userId);

    boolean isConfigured();

    Map<String, Object> getServiceStatus();
}

