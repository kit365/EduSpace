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
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

/**
 * Phụ thu theo ngày trong tuần (cuối tuần) hoặc ngày lễ — không còn theo khung giờ.
 */
@Entity
@Table(name = "room_custom_prices")
@Getter
@Setter
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RoomCustomPriceEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    RoomEntity room;

    /** Ví dụ: SATURDAY, SUNDAY — tuỳ convention app. */
    @Column(name = "day_of_week")
    String dayOfWeek;

    /** Ngày lễ cụ thể (nếu có). */
    @Column(name = "specific_date")
    LocalDate specificDate;

    @Column(name = "price_modifier", precision = 8, scale = 4, nullable = false)
    BigDecimal priceModifier;
}
