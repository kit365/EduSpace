package com.eduspace.roomservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "room_amenities")
@Getter
@Setter
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RoomAmenityEntity extends BaseEntity {

    @EmbeddedId
    RoomAmenityId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("roomId")
    @JoinColumn(name = "room_id", nullable = false)
    RoomEntity room;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("amenityId")
    @JoinColumn(name = "amenity_id", nullable = false)
    AmenityEntity amenity;

    @Column(name = "quantity")
    Integer quantity;

    @Column(name = "notes", columnDefinition = "TEXT")
    String notes;

    /**
     * Grouping type for UI/behavior.
     * - POLICY: "CHÍNH SÁCH CHO PHÒNG"
     * - AMENITY: "TIỆN ÍCH & TRANG THIẾT BỊ"
     */
    @Column(name = "type")
    String type;

    @PrePersist
    void ensureCompositeId() {
        if (id == null) {
            id = new RoomAmenityId();
        }
        if (room != null && room.getId() != null) {
            id.setRoomId(room.getId());
        }
        if (amenity != null && amenity.getId() != null) {
            id.setAmenityId(amenity.getId());
        }
    }

}
