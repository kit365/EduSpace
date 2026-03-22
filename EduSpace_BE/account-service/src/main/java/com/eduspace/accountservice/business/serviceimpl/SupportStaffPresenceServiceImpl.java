package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.SupportStaffPresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SupportStaffPresenceServiceImpl implements SupportStaffPresenceService {

    static final String ZSET_KEY = "support:admin:presence";

    private final StringRedisTemplate redisTemplate;

    @Value("${app.support-presence.window-ms:90000}")
    private long windowMs;

    @Override
    public void recordPresence(String keycloakUserId) {
        if (keycloakUserId == null || keycloakUserId.isBlank()) {
            return;
        }
        long now = System.currentTimeMillis();
        redisTemplate.opsForZSet().add(ZSET_KEY, keycloakUserId, (double) now);
    }

    @Override
    public long countOnline() {
        long now = System.currentTimeMillis();
        double cutoff = (double) (now - windowMs);
        redisTemplate.opsForZSet().removeRangeByScore(ZSET_KEY, 0, cutoff);
        Long size = redisTemplate.opsForZSet().size(ZSET_KEY);
        return size != null ? size : 0L;
    }

    @Override
    public Set<String> getOnlineMemberIds() {
        long now = System.currentTimeMillis();
        double cutoff = (double) (now - windowMs);
        redisTemplate.opsForZSet().removeRangeByScore(ZSET_KEY, 0, cutoff);
        Set<String> members = redisTemplate.opsForZSet().range(ZSET_KEY, 0, -1);
        return members != null ? members : Collections.emptySet();
    }
}
