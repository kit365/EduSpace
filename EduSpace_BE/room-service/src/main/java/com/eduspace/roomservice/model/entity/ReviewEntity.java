package com.eduspace.roomservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class ReviewEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    RoomEntity room;

    @Column(name = "author_id")
    String authorId; // From account-service

    @Column(name = "booking_id")
    Integer bookingId; // From booking-service

    @Column(name = "rating")
    Short rating;

    @Column(name = "comment", columnDefinition = "TEXT")
    String comment;

    @Column(name = "status")
    String status; // PENDING, APPROVED, REJECTED

    @Column(name = "reply", columnDefinition = "TEXT")
    String reply;

    @Column(name = "reply_at")
    LocalDateTime replyAt;
}
