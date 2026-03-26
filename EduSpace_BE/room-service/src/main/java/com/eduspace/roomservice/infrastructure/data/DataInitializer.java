package com.eduspace.roomservice.infrastructure.data;

import com.eduspace.roomservice.model.entity.*;
import com.eduspace.roomservice.persistence.repository.*;
import com.eduspace.roomservice.common.util.SlugUtil;
import com.eduspace.roomservice.common.util.ImageAltUtil;
import com.eduspace.roomservice.common.enums.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;
    private final RoomCategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        // Property count check ensures we only seed if the DB is empty.
        if (propertyRepository.count() == 0) {
            log.info("Initializing sample data for room-service...");
            seedData();
            log.info("Sample data initialization completed.");
        }
    }

    private void seedData() {
        String hostId = "host-1234-5678";

        // 0.1 Fetch Amenities (already seeded by Flyway V2)
        List<String> amenityNames = List.of("Wifi", "Tivi/Projector", "Điều hòa", "Bảng trắng", "Bình nước", "Ghi âm");
        List<AmenityEntity> amenities = amenityNames.stream()
                .map(name -> {
                    return amenityRepository.findByNameVi(name)
                        .orElseGet(() -> {
                            AmenityEntity am = AmenityEntity.builder()
                                .nameVi(name)
                                .nameEn(name)
                                .type(AmenityType.FEATURE.name())
                                .position(0)
                                .build();
                            return amenityRepository.save(am);
                        });
                })
                .toList();

        // 1. Create Property
        PropertyEntity property = PropertyEntity.builder()
                .ownerId(hostId)
                .nameVi("EduSpace Central Hub")
                .nameEn("EduSpace Central Hub")
                .propertyType("CENTER_COWORKING")
                .contactPhone("0901234567")
                .contactEmail("contact@eduspace.vn")
                .provinceCode("79")
                .districtCode("760")
                .wardCode("26734")
                .addressDetailVi("Số 10 Mai Chí Thọ, Quận 2")
                .addressDetailEn("10 Mai Chi Tho St, District 2")
                .descriptionVi("Không gian làm việc sáng tạo bậc nhất thành phố, đầy đủ tiện nghi.")
                .descriptionEn("Top-tier creative workspace with full amenities.")
                .latitude(new BigDecimal("10.7719"))
                .longitude(new BigDecimal("106.7048"))
                .logo("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400")
                .logoAltVi(ImageAltUtil.generateLogoAlt("EduSpace Central Hub", "vi"))
                .logoAltEn(ImageAltUtil.generateLogoAlt("EduSpace Central Hub", "en"))
                .status("VERIFIED")
                .build();

        property = propertyRepository.save(property);

        // 2. Create Rooms
        createRoom(property, "Executive Boardroom A", "Executive Boardroom A", RoomType.MEETING_ROOM, "meeting-room", 250000.0, 30.0, 4.9, 120, 
            "https://images.unsplash.com/photo-1703355685952-03ed19f70f51?auto=format&fit=crop&q=80&w=800",
            "Phòng họp cao cấp với trang thiết bị hiện đại, tivi 75 inch, bảng kính.", 
            "Premium meeting room with modern equipment, 75-inch TV, glass board.", amenities);
        
        createRoom(property, "Creative Studio B", "Creative Studio B", RoomType.MEETING_ROOM, "meeting-room", 180000.0, 20.0, 4.7, 45,
            "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
            "Không gian lý tưởng cho brain-storming và thảo luận nhóm nhỏ.",
            "Ideal space for brain-storming and small group discussions.", amenities);

        createRoom(property, "Modern Classroom 101", "Modern Classroom 101", RoomType.CLASSROOM, "classroom", 350000.0, 60.0, 4.8, 85,
            "https://images.unsplash.com/photo-1631885661110-aa12f8b42b25?auto=format&fit=crop&q=80&w=800",
            "Thiết kế truyền thống kết hợp công nghệ giảng dạy mới nhất.",
            "Traditional design combined with the latest teaching technology.", amenities);
    }

    private void createRoom(PropertyEntity property, String nameVi, String nameEn, RoomType type, String categorySlug, Double price, Double area, Double rating, Integer reviews, String image, String descVi, String descEn, List<AmenityEntity> allAmenities) {
        RoomCategoryEntity category = categoryRepository.findBySlug(categorySlug)
                .orElseThrow(() -> new RuntimeException("Category not found: " + categorySlug));
        
        RoomEntity room = RoomEntity.builder()
                .property(property)
                .nameVi(nameVi)
                .nameEn(nameEn)
                .slug(SlugUtil.uniqueSlug(nameVi, s -> roomRepository.existsBySlugAndDeletedAtIsNull(s)))
                .roomType(type.name())
                .category(category)
                .roomNumber("R" + (int)(Math.random() * 900 + 100))
                .floorNumber(String.valueOf((int)(Math.random() * 5 + 1)))
                .capacity(type == RoomType.EVENT_SPACE ? 100 : 20)
                .area(BigDecimal.valueOf(area))
                .pricePerHour(BigDecimal.valueOf(price))
                .pricePerDay(BigDecimal.valueOf(price * 7))
                .minBookingHours(1)
                .minDuration(60)
                .stepUnit(30)
                .weekendSurchargeEnabled(false)
                .weekendSurchargePercent(BigDecimal.ZERO)
                .weekendApplySaturday(false)
                .weekendApplySunday(true)
                .images(image)
                .avgRating(BigDecimal.valueOf(rating))
                .reviewCount(reviews)
                .status(RoomStatus.READY.name())
                .approvalStatus(RoomApprovalStatus.APPROVED.name())
                .descriptionVi(descVi)
                .descriptionEn(descEn)
                .imagesAltVi(ImageAltUtil.generateRoomAlt(nameVi, "vi"))
                .imagesAltEn(ImageAltUtil.generateRoomAlt(nameEn, "en"))
                .is24_7(true)
                .isActive(true)
                .locationVi(property.getAddressDetailVi() + " · Phòng " + "R" + (int)(Math.random() * 900 + 100))
                .locationEn(property.getAddressDetailEn() + " · Room " + "R" + (int)(Math.random() * 900 + 100))
                .build();

        // Policies
        room.getPolicies().add(RoomPolicyEntity.builder()
                .room(room)
                .nameVi("Hủy phòng linh hoạt")
                .nameEn("Flexible cancellation")
                .descriptionVi("Hoàn phí nếu hủy sớm.")
                .descriptionEn("Refund if cancelled early.")
                .logoAltVi(ImageAltUtil.generatePolicyAlt("Hủy phòng linh hoạt", "vi"))
                .logoAltEn(ImageAltUtil.generatePolicyAlt("Flexible cancellation", "en"))
                .position(1)
                .build());
        room.getPolicies().add(RoomPolicyEntity.builder()
                .room(room)
                .nameVi("Nội quy")
                .nameEn("House rules")
                .descriptionVi("Không hút thuốc, giữ vệ sinh.")
                .descriptionEn("No smoking, keep clean.")
                .logoAltVi(ImageAltUtil.generatePolicyAlt("Nội quy", "vi"))
                .logoAltEn(ImageAltUtil.generatePolicyAlt("House rules", "en"))
                .position(2)
                .build());

        // Random Amenities
        for(int i=0; i<3; i++) {
            AmenityEntity am = allAmenities.get((int)(Math.random() * allAmenities.size()));
            RoomAmenityEntity ra = RoomAmenityEntity.builder()
                .room(room)
                .amenity(am)
                .quantity(1)
                .build();
            room.getAmenities().add(ra);
        }

        roomRepository.save(room);
    }
}
