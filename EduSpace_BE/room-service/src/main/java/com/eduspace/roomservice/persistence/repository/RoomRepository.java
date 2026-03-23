package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<RoomEntity, Integer>, JpaSpecificationExecutor<RoomEntity> {

    List<RoomEntity> findByProperty_Id(Integer propertyId);

    Optional<RoomEntity> findBySlug(String slug);

    /** Phòng chưa xóa mềm (deleted_at IS NULL). */
    List<RoomEntity> findByDeletedAtIsNull();

    List<RoomEntity> findByProperty_IdAndDeletedAtIsNull(Integer propertyId);

    /** Phòng thuộc property của chủ (owner_id), chưa xóa mềm. */
    List<RoomEntity> findByProperty_OwnerIdAndDeletedAtIsNull(String ownerId);

    Optional<RoomEntity> findByIdAndDeletedAtIsNull(Integer id);

    Optional<RoomEntity> findBySlugAndDeletedAtIsNull(String slug);

    List<RoomEntity> findByCategory_SlugAndDeletedAtIsNull(String categorySlug);

    boolean existsBySlugAndDeletedAtIsNull(String slug);
}
