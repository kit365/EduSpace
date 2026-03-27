package com.eduspace.accountservice.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "host_staff_links")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HostStaffLinkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "host_user_id", nullable = false, length = 36)
    String hostUserId;

    @Column(name = "staff_user_id", nullable = false, unique = true, length = 36)
    String staffUserId;

    /** ID cơ sở (property) trong room-service — dùng cho quản lý chi nhánh. */
    @Column(name = "branch_property_id")
    Long branchPropertyId;

    /**
     * Per-host manager permissions (CSV, lowercase keys), e.g.:
     * branch.booking.view,branch.booking.manage,...
     */
    @Column(name = "manager_permission_names")
    String managerPermissionNames;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
