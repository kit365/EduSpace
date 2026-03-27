package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.DashboardAggregatorService;
import com.eduspace.accountservice.business.service.HostPartnerApplicationService;
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.common.RoleConstants;
import com.eduspace.accountservice.infrastructure.client.RoomClient;
import com.eduspace.accountservice.model.dto.response.dashboard.*;
import com.eduspace.accountservice.model.entity.DashboardStatsEntity;
import com.eduspace.accountservice.persistence.repository.DashboardStatsRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardAggregatorServiceImpl implements DashboardAggregatorService {

    private final UserService userService;
    private final HostPartnerApplicationService hostApplicationService;
    private final DashboardStatsRepository dashboardStatsRepository;
    private final RoomClient roomClient;

    @Override
    @Transactional
    @CircuitBreaker(name = "dashboardService", fallbackMethod = "fallbackAggregateAndSave")
    public DashboardStatsEntity aggregateAndSave() {
        log.info("Aggregating dashboard stats from local and room services (Parallel)");

        // 1. Stats from Account-Service
        CompletableFuture<Long> totalUsersFuture = CompletableFuture.supplyAsync(userService::countTotalUsers);
        CompletableFuture<Long> activeHostsFuture = CompletableFuture.supplyAsync(() -> userService.countUsersByRole(RoleConstants.TUTOR));
        CompletableFuture<Long> pendingKycFuture = CompletableFuture.supplyAsync(hostApplicationService::countPendingApplications);

        // 2. Room stats & Pending Listings (Parallel)
        CompletableFuture<RoomDashboardStatsResponse> roomStatsFuture = CompletableFuture.supplyAsync(() -> {
            try {
                var response = roomClient.getStats();
                return (response != null) ? response.data() : null;
            } catch (Exception e) {
                log.warn("Failed to fetch room stats: {}", e.getMessage());
                return null;
            }
        });

        CompletableFuture<List<PropertyResponse>> pendingListingsFuture = CompletableFuture.supplyAsync(() -> {
            try {
                var response = roomClient.getPendingProperties();
                return (response != null && response.data() != null) ? response.data() : new ArrayList<>();
            } catch (Exception e) {
                log.warn("Failed to fetch pending listings: {}", e.getMessage());
                return new ArrayList<>();
            }
        });

        // Wait for all futures to complete
        CompletableFuture.allOf(
                totalUsersFuture, activeHostsFuture, pendingKycFuture,
                roomStatsFuture, pendingListingsFuture
        ).join();

        // 3. Build Snapshot (Booking data removed to avoid conflicts)
        DashboardStatsEntity entity = DashboardStatsEntity.builder()
                .totalUsers(totalUsersFuture.join())
                .activeHosts(activeHostsFuture.join())
                .pendingKyc(pendingKycFuture.join())
                .totalListings(roomStatsFuture.join() != null ? roomStatsFuture.join().getTotalListings() : 0L)
                .newListingsToday(roomStatsFuture.join() != null ? roomStatsFuture.join().getNewListingsToday() : 0L)
                .totalBookings(0L) // Reverted
                .totalRevenue(0.0) // Reverted
                .successRate(0.0) // Reverted
                .categoryDistribution(roomStatsFuture.join() != null ? roomStatsFuture.join().getCategoryDistribution() : null)
                .pendingListings(pendingListingsFuture.join())
                .topHosts(new ArrayList<>()) // Reverted
                .build();

        log.info("Dashboard stats aggregated (decoupled) successfully");
        return dashboardStatsRepository.save(entity);
    }

    /** Fallback method for Circuit Breaker */
    public DashboardStatsEntity fallbackAggregateAndSave(Exception e) {
        log.error("Circuit Breaker triggered for dashboard aggregation: {}", e.getMessage());
        return dashboardStatsRepository.findLatest()
                .orElse(DashboardStatsEntity.builder()
                        .totalUsers(0L)
                        .activeHosts(0L)
                        .totalRevenue(0.0)
                        .pendingListings(new ArrayList<>())
                        .topHosts(new ArrayList<>())
                        .build());
    }
}
