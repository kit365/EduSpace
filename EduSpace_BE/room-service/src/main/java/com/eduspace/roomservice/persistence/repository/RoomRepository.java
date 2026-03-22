package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<RoomEntity, Integer> {

    List<RoomEntity> findByProperty_Id(Integer propertyId);

    Optional<RoomEntity> findBySlug(String slug);

    /** Phòng chưa xóa mềm (deleted_at IS NULL). */
    List<RoomEntity> findByDeletedAtIsNull();

    List<RoomEntity> findByProperty_IdAndDeletedAtIsNull(Integer propertyId);

    /** Phòng thuộc property của chủ (owner_id), chưa xóa mềm. */
    List<RoomEntity> findByProperty_OwnerIdAndDeletedAtIsNull(String ownerId);

    Optional<RoomEntity> findByIdAndDeletedAtIsNull(Integer id);

    Optional<RoomEntity> findBySlugAndDeletedAtIsNull(String slug);

    boolean existsBySlugAndDeletedAtIsNull(String slug);
}
