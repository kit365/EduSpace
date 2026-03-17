package com.eduspace.accountservice.model.mapper;

import com.eduspace.accountservice.model.dto.reward.RewardCatalogRequest;
import com.eduspace.accountservice.model.dto.reward.RewardCatalogResponse;
import com.eduspace.accountservice.model.entity.RewardCatalogEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RewardMapper {

    RewardCatalogResponse toResponse(RewardCatalogEntity entity);

    RewardCatalogEntity toEntity(RewardCatalogRequest request);

    void updateEntity(@MappingTarget RewardCatalogEntity entity, RewardCatalogRequest request);
}
