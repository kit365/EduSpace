package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.UserPermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface UserPermissionRepository extends JpaRepository<UserPermissionEntity, Long> {

    @Query("SELECT p.name FROM UserPermissionEntity up JOIN up.permission p WHERE up.user.id = :userId")
    Set<String> findPermissionNamesByUserId(@Param("userId") String userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM UserPermissionEntity up WHERE up.user.id = :userId")
    void deleteAllByUserId(@Param("userId") String userId);
}
