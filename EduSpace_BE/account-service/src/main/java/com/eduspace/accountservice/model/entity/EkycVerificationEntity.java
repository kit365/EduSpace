package com.eduspace.accountservice.model.entity;

import com.eduspace.accountservice.common.enums.VerificationStatus;
import jakarta.persistence.*;
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

    @JoinColumn(name = "user_id")
    @ManyToOne(fetch = FetchType.LAZY)
    UserEntity user;

    /** VERIFIED or FAILED */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    VerificationStatus status;

    @Column(name = "id_card_number", length = 50)
    String idCardNumber;

    @Column(name = "legal_name")
    String legalName;

    @Column(name = "dob")
    java.time.LocalDate dob;

    @Column(name = "address", length = 500)
    String address;

    @Column(name = "id_card_front_url")
    String idCardFrontUrl;

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
