package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String>, JpaSpecificationExecutor<UserEntity> {

    Optional<UserEntity> findByKeycloakId(String keycloakId);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);
}
