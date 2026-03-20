package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String>, JpaSpecificationExecutor<UserEntity> {

    Optional<UserEntity> findByKeycloakId(String keycloakId);

    List<UserEntity> findAllByKeycloakIdIn(List<String> keycloakIds);

    @Query("""
            select u from UserEntity u
            where lower(u.email) like lower(concat('%', :query, '%'))
               or lower(u.fullName) like lower(concat('%', :query, '%'))
            order by u.fullName asc
            """)
    List<UserEntity> searchByEmailOrFullName(@Param("query") String query);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);
}
