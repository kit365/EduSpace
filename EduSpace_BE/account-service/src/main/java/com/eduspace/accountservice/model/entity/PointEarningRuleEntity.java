package com.eduspace.accountservice.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "point_earning_rules")
@Getter
@Setter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class PointEarningRuleEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    Long id;

    @Column(name = "action_name", nullable = false, unique = true)
    String actionName;

    @Column(name = "points_earned", nullable = false)
    Integer pointsEarned;

    @Column(name = "description")
    String description;

    @Builder.Default
    @Column(name = "is_active")
    Boolean isActive = true;
}
