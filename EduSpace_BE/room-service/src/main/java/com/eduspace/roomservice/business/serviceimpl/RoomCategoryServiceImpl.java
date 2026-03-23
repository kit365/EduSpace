package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomCategoryService;
import com.eduspace.roomservice.model.dto.request.RoomCategoryRequest;
import com.eduspace.roomservice.model.dto.response.RoomCategoryResponse;
import com.eduspace.roomservice.model.entity.RoomCategoryEntity;
import com.eduspace.roomservice.model.mapper.RoomCategoryMapper;
import com.eduspace.roomservice.persistence.repository.RoomCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomCategoryServiceImpl implements RoomCategoryService {

    private final RoomCategoryRepository categoryRepository;
    private final RoomCategoryMapper categoryMapper;

    @Override
    public List<RoomCategoryResponse> getFeaturedCategories() {
        return categoryRepository.findByIsFeaturedTrue().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomCategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RoomCategoryResponse updateCategory(Integer id, RoomCategoryRequest request) {
        RoomCategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        if (request.getIsFeatured() != null && request.getIsFeatured()) {
            long featuredCount = categoryRepository.findByIsFeaturedTrue().size();
            // If the category is already featured, it's fine. If not, check the count.
            if (!entity.getIsFeatured() && featuredCount >= 3) {
                throw new RuntimeException("Maximum 3 featured categories allowed. Please un-feature another one first.");
            }
        }
        
        if (request.getNameVi() != null) entity.setNameVi(request.getNameVi());
        if (request.getNameEn() != null) entity.setNameEn(request.getNameEn());
        if (request.getDescriptionVi() != null) entity.setDescriptionVi(request.getDescriptionVi());
        if (request.getDescriptionEn() != null) entity.setDescriptionEn(request.getDescriptionEn());
        if (request.getImage() != null) entity.setImage(request.getImage());
        if (request.getImageAltVi() != null) entity.setImageAltVi(request.getImageAltVi());
        if (request.getImageAltEn() != null) entity.setImageAltEn(request.getImageAltEn());
        if (request.getIsFeatured() != null) entity.setIsFeatured(request.getIsFeatured());
        if (request.getPosition() != null) entity.setPosition(request.getPosition());
        
        return categoryMapper.toResponse(categoryRepository.save(entity));
    }
}
