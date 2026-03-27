package com.eduspace.roomservice.persistence.specification;

import com.eduspace.roomservice.model.dto.request.RoomSearchRequest;
import com.eduspace.roomservice.model.entity.RoomAmenityEntity;
import com.eduspace.roomservice.model.entity.RoomEntity;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class RoomSpecification {

    public static Specification<RoomEntity> hasFilters(RoomSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Core Status: active, approved, not deleted
            predicates.add(cb.isNull(root.get("deletedAt")));
            predicates.add(cb.equal(root.get("isActive"), true));
            predicates.add(cb.equal(root.get("approvalStatus"), "APPROVED"));

            // 2. Keyword Search
            if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                String pattern = "%" + request.getKeyword().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("nameVi")), pattern),
                        cb.like(cb.lower(root.get("nameEn")), pattern),
                        cb.like(cb.lower(root.get("descriptionVi")), pattern),
                        cb.like(cb.lower(root.get("descriptionEn")), pattern)
                ));
            }

            // 3. Category Filter
            if (request.getCategorySlug() != null && !request.getCategorySlug().isBlank()) {
                predicates.add(cb.equal(root.get("category").get("slug"), request.getCategorySlug()));
            }

            // 4. Capacity Filter (At least X capacity)
            if (request.getMinCapacity() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), request.getMinCapacity()));
            }

            // 5. Price Range (Hourly)
            if (request.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerHour"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerHour"), request.getMaxPrice()));
            }

            // 6. Amenities Filter (Must have ALL or ANY? usually ANY if multiple selected)
            if (request.getAmenityIds() != null && !request.getAmenityIds().isEmpty()) {
                Join<RoomEntity, RoomAmenityEntity> amenityJoin = root.join("amenities");
                predicates.add(amenityJoin.get("amenity").get("id").in(request.getAmenityIds()));
                query.distinct(true);
            }

            // 7. Location (Property level)
            if (request.getProvinceCode() != null && !request.getProvinceCode().isBlank()) {
                predicates.add(cb.equal(root.get("property").get("provinceCode"), request.getProvinceCode()));
            }
            if (request.getDistrictCode() != null && !request.getDistrictCode().isBlank()) {
                predicates.add(cb.equal(root.get("property").get("districtCode"), request.getDistrictCode()));
            }
            if (request.getWardCode() != null && !request.getWardCode().isBlank()) {
                predicates.add(cb.equal(root.get("property").get("wardCode"), request.getWardCode()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
