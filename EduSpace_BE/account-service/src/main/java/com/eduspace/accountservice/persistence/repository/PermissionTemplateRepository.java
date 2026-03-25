package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.PermissionTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionTemplateRepository extends JpaRepository<PermissionTemplateEntity, Long> {

    Optional<PermissionTemplateEntity> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    /**
     * No DISTINCT FETCH JOIN here — PostgreSQL/Hibernate often fail or duplicate rows; dedupe by id in service.
     */
    @Query("SELECT t FROM PermissionTemplateEntity t LEFT JOIN FETCH t.permissions")
    List<PermissionTemplateEntity> findAllWithPermissions();

    @Query("SELECT t FROM PermissionTemplateEntity t LEFT JOIN FETCH t.permissions WHERE t.id = :id")
    Optional<PermissionTemplateEntity> findByIdWithPermissions(@Param("id") Long id);
}
