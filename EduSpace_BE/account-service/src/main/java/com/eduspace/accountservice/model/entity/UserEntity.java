package com.eduspace.accountservice.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    String id;

    @Column(name = "keycloak_id", unique = true, nullable = false)
    String keycloakId;

    @Column(unique = true, nullable = false)
    String email;

    @Column(name = "full_name", nullable = false)
    String fullName;

    @Column(name = "phone_number")
    String phoneNumber;

    @Column(name = "avatar_url")
    String avatarUrl;

    @Column(name = "location")
    String location;

    @Column(name = "short_bio", length = 500)
    String shortBio;

    @Column(name = "city_state")
    String cityState;

    @Column(name = "district")
    String district;

    @Column(name = "ward")
    String ward;

    @Column(name = "street_address", length = 500)
    String streetAddress;

    @Column(name = "postal_code", length = 20)
    String postalCode;

    @Column(name = "tax_id", length = 50)
    String taxId;

    @Column(name = "host_type")
    String hostType;

    @Column(name = "organization_name")
    String organizationName;

    @Column(name = "verification_document")
    String verificationDocument;

    @Column(name = "verification_status")
    String verificationStatus;

    @Builder.Default
    @Column(name = "is_active")
    Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_email_verified")
    Boolean isEmailVerified = false;

    @Builder.Default
    @Column(name = "is_2fa_enabled")
    Boolean is2faEnabled = false;

    @Column(name = "totp_secret")
    String totpSecret;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    Set<RoleEntity> roles = new HashSet<>();

    @Column(name = "point_balance")
    Integer pointBalance;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
