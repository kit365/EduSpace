package com.eduspace.accountservice.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "loyalty_config")
@Getter
@Setter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyConfigEntity extends BaseEntity {

    @Id
    @Column(name = "id")
    Long id;

    @Column(name = "vnd_per_point", nullable = false)
    Integer vndPerPoint;
}
