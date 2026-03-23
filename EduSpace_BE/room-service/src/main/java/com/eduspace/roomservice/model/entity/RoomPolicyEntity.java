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
@Table(name = "room_policies")
@Getter
@Setter
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RoomPolicyEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    RoomEntity room;

    @Column(name = "name_vi")
    String nameVi;

    @Column(name = "name_en")
    String nameEn;

    @Column(name = "description_vi", columnDefinition = "TEXT")
    String descriptionVi;

    @Column(name = "description_en", columnDefinition = "TEXT")
    String descriptionEn;

    @Column(name = "logo", columnDefinition = "TEXT")
    String logo;

    @Column(name = "logo_alt_vi")
    String logoAltVi;

    @Column(name = "logo_alt_en")
    String logoAltEn;

    @Builder.Default
    @Column(name = "position")
    Integer position = 0;
}
