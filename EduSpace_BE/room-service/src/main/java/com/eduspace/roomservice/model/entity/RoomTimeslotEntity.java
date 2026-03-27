package com.eduspace.roomservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "room_timeslots")
@Getter
@Setter
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RoomTimeslotEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "room_id", nullable = false)
    Integer roomId;

    @Column(name = "slot_type", nullable = false)
    String slotType;

    @Column(name = "day_of_week", nullable = false)
    Integer dayOfWeek;

    @Column(name = "start_time", nullable = false)
    LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalTime endTime;

    @Column(name = "duration_mode", nullable = false)
    String durationMode;

    @Column(name = "duration_step", nullable = false)
    Integer durationStep;

    @Column(name = "is_active", nullable = false)
    Boolean isActive;
}
