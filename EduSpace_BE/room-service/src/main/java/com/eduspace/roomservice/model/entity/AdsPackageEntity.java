package com.eduspace.roomservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "ads_packages")
@Getter
@Setter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class AdsPackageEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "name_vi")
    String nameVi;

    @Column(name = "name_en")
    String nameEn;

    @Column(name = "description_vi", columnDefinition = "TEXT")
    String descriptionVi;

    @Column(name = "description_en", columnDefinition = "TEXT")
    String descriptionEn;

    @Column(name = "duration_days")
    Integer durationDays;

    @Column(name = "price")
    Long price;

    @Column(name = "status")
    String status;

    @Builder.Default
    Integer position = 0;
}
