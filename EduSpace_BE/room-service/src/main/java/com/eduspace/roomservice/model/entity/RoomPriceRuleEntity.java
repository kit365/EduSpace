package com.eduspace.roomservice.model.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "room_price_rule")
@Getter
@Setter
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RoomPriceRuleEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    RoomEntity room;

    @Column(name = "min_hours", nullable = false)
    Integer minHours;

    @Column(name = "max_hours")
    Integer maxHours;

    @Column(name = "price_per_hour", precision = 15, scale = 2)
    BigDecimal pricePerHour;

    @Column(name = "flat_price", precision = 15, scale = 2)
    BigDecimal flatPrice;

    @Column(name = "label")
    String label;

    /**
     * Empty = rule applies every day (backward compatible). Otherwise subset of {@code day_of_week} in [2..8]
     * matching {@link RoomScheduleEntity#getDayOfWeek()}.
     */
    @Builder.Default
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "room_price_rule_schedule", joinColumns = @JoinColumn(name = "room_price_rule_id"))
    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "day_of_week", nullable = false)
    Set<Integer> applicableDayOfWeeks = new HashSet<>();
}
