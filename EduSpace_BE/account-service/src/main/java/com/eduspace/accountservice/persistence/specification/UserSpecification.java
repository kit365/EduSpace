package com.eduspace.accountservice.persistence.specification;

import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<UserEntity> hasFilters(
            String search, 
            List<String> mappedRoles, 
            String status, 
            boolean isSuperAdmin, 
            UserEntity requester
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Search Logic
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }

            // 2. Role Filter
            if (mappedRoles != null && !mappedRoles.isEmpty()) {
                Join<UserEntity, RoleEntity> joinRole = root.join("roles");
                predicates.add(joinRole.get("name").in(mappedRoles));
            }

            // 3. Hierarchy: exclude users by role and self
            if (requester != null) {
                predicates.add(cb.notEqual(root.get("id"), requester.getId()));
                
                String requesterRole = requester.getRoles().stream()
                        .map(RoleEntity::getName)
                        .findFirst()
                        .orElse("");

                if ("SUPER_ADMIN".equals(requesterRole)) {
                    // Super Admin sees everyone EXCEPT other Super Admins and self
                    predicates.add(cb.not(root.join("roles").get("name").in(List.of("SUPER_ADMIN"))));
                } else if ("ADMIN".equals(requesterRole)) {
                    // Admin sees everyone EXCEPT other Admins, Super Admins and self
                    predicates.add(cb.not(root.join("roles").get("name").in(List.of("SUPER_ADMIN", "ADMIN"))));
                }
            }

            // 4. Status Filter
            if (status != null && !"Tất cả".equals(status)) {
                predicates.add(cb.equal(root.get("isActive"), "Active".equalsIgnoreCase(status)));
            }

            if (mappedRoles != null && !mappedRoles.isEmpty()) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
