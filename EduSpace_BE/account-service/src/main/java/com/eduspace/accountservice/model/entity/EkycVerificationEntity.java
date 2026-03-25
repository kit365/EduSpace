package com.eduspace.accountservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "ekyc_verifications")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EkycVerificationEntity extends BaseEntity {

    @Id
    @Column(name = "id")
    String id;

    @Column(name = "user_id", nullable = false)
    String userId;

    /** VERIFIED or FAILED */
    @Column(name = "status", nullable = false, length = 32)
    String status;

    @Column(name = "id_number_hash", length = 64)
    String idNumberHash;

    @Column(name = "face_distance")
    Double faceDistance;

    @Column(name = "liveness_score")
    Double livenessScore;

    @Column(name = "face_verified")
    Boolean faceVerified;

    @Column(name = "liveness_passed")
    Boolean livenessPassed;

    @Column(name = "failure_reason", length = 500)
    String failureReason;
}
