package com.eduspace.accountservice.persistence.specification;

import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.RoleEntity_;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.model.entity.UserEntity_;
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
                        cb.like(cb.lower(root.get(UserEntity_.FULL_NAME)), pattern),
                        cb.like(cb.lower(root.get(UserEntity_.EMAIL)), pattern)
                ));
            }

            // 2. Role Filter
            if (mappedRoles != null && !mappedRoles.isEmpty()) {
                Join<UserEntity, RoleEntity> joinRole = root.join(UserEntity_.ROLES);
                predicates.add(joinRole.get(RoleEntity_.NAME).in(mappedRoles));
            }

            // 3. Hierarchy: exclude users by role
            if (!isSuperAdmin) {
                Subquery<String> subq = query.subquery(String.class);
                Root<UserEntity> subRoot = subq.from(UserEntity.class);
                Join<UserEntity, RoleEntity> subJoin = subRoot.join(UserEntity_.ROLES);
                subq.select(subRoot.get(UserEntity_.ID))
                    .where(cb.or(
                        cb.equal(subJoin.get(RoleEntity_.NAME), "ADMIN"),
                        cb.equal(subJoin.get(RoleEntity_.NAME), "SUPER_ADMIN")
                    ));
                predicates.add(cb.not(root.get(UserEntity_.ID).in(subq)));
            } else {
                Subquery<String> subq = query.subquery(String.class);
                Root<UserEntity> subRoot = subq.from(UserEntity.class);
                Join<UserEntity, RoleEntity> subJoin = subRoot.join(UserEntity_.ROLES);
                subq.select(subRoot.get(UserEntity_.ID))
                    .where(cb.equal(subJoin.get(RoleEntity_.NAME), "SUPER_ADMIN"));
                predicates.add(cb.or(
                    cb.not(root.get(UserEntity_.ID).in(subq)),
                    cb.equal(root.get(UserEntity_.ID), requester.getId())
                ));
            }

            // 4. Status Filter
            if (status != null && !"Tất cả".equals(status)) {
                predicates.add(cb.equal(root.get(UserEntity_.IS_ACTIVE), "Active".equalsIgnoreCase(status)));
            }

            if (mappedRoles != null && !mappedRoles.isEmpty()) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
