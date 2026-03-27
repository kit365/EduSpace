package com.eduspace.accountservice.model.entity;

import com.eduspace.accountservice.model.dto.response.dashboard.PropertyResponse;
import com.eduspace.accountservice.model.dto.response.dashboard.TopHostResponse;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;

/**
 * Snapshot của các chỉ số Dashboard để tránh tính toán lại nhiều lần.
 * Dữ liệu được cập nhật qua Cron job hoặc Event-driven.
 */
@Entity
@Table(name = "dashboard_stats")
@Getter
@Setter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "total_users")
    Long totalUsers;

    @Column(name = "active_hosts")
    Long activeHosts;

    @Column(name = "total_listings")
    Long totalListings;

    @Column(name = "total_bookings")
    Long totalBookings;

    @Column(name = "total_revenue")
    Double totalRevenue;

    @Column(name = "pending_kyc")
    Long pendingKyc;

    @Column(name = "new_listings_today")
    Long newListingsToday;

    @Column(name = "success_rate")
    Double successRate;

    /** Tự động serialize/deserialize sang JSON string thông qua Hibernate 6 */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "category_distribution", columnDefinition = "jsonb")
    Map<String, Long> categoryDistribution;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "pending_listings", columnDefinition = "jsonb")
    List<PropertyResponse> pendingListings;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "top_hosts", columnDefinition = "jsonb")
    List<TopHostResponse> topHosts;
}
