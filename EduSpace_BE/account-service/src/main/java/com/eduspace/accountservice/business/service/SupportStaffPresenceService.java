package com.eduspace.accountservice.business.service;

import java.util.Set;

public interface SupportStaffPresenceService {

    void recordPresence(String keycloakUserId);

    long countOnline();

    /** Keycloak user ids still present in the presence window (after stale cleanup). */
    Set<String> getOnlineMemberIds();
}
