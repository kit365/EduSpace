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
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "room_categories")
@Getter
@Setter
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RoomCategoryEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "name_vi", nullable = false)
    String nameVi;

    @Column(name = "name_en")
    String nameEn;

    @Column(name = "slug", nullable = false, unique = true)
    String slug;

    @Column(name = "description_vi", columnDefinition = "TEXT")
    String descriptionVi;

    @Column(name = "description_en", columnDefinition = "TEXT")
    String descriptionEn;

    @Column(name = "image")
    String image;

    @Column(name = "image_alt_vi")
    String imageAltVi;

    @Column(name = "image_alt_en")
    String imageAltEn;

    @Builder.Default
    @Column(name = "is_featured")
    Boolean isFeatured = false;

    @Builder.Default
    @Column(name = "position")
    Integer position = 0;
}
