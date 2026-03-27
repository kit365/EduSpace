package com.eduspace.accountservice.model.mapper;

import com.eduspace.accountservice.model.dto.request.pointrule.PointEarningRuleRequest;
import com.eduspace.accountservice.model.dto.response.pointrule.PointEarningRuleResponse;
import com.eduspace.accountservice.model.dto.transaction.PointTransactionResponse;
import com.eduspace.accountservice.model.entity.PointEarningRuleEntity;
import com.eduspace.accountservice.model.entity.PointTransactionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PointMapper {

    PointEarningRuleResponse toResponse(PointEarningRuleEntity entity);

    PointEarningRuleEntity toEntity(PointEarningRuleRequest request);

    void updateEntity(@MappingTarget PointEarningRuleEntity entity, PointEarningRuleRequest request);

    @Mapping(target = "userFullName", source = "user.fullName")
    PointTransactionResponse toResponse(PointTransactionEntity entity);
}
