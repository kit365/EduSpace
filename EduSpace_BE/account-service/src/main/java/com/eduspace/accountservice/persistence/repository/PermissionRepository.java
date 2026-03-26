package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<PermissionEntity, Long> {
    List<PermissionEntity> findByGroupName(String groupName);
    Optional<PermissionEntity> findByNameIgnoreCase(String name);

    List<PermissionEntity> findByNameIn(Collection<String> names);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    /** Native SQL avoids JPQL/HQL edge cases around ordering by a property named like reserved words (e.g. group). */
    @Query(value = "SELECT * FROM permissions ORDER BY group_name ASC NULLS LAST, name ASC", nativeQuery = true)
    List<PermissionEntity> findAllOrderedByGroupAndName();
}
