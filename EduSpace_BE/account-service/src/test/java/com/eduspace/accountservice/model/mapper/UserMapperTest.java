package com.eduspace.accountservice.model.mapper;

import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.persistence.repository.EkycVerificationRepository;
import com.eduspace.accountservice.persistence.repository.PermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class UserMapperTest {

    private EkycVerificationRepository ekycVerificationRepository;
    private PermissionRepository permissionRepository;
    private UserMapper userMapper;

    @BeforeEach
    void setUp() {
        ekycVerificationRepository = mock(EkycVerificationRepository.class);
        permissionRepository = mock(PermissionRepository.class);
        userMapper = new UserMapper(ekycVerificationRepository, permissionRepository);
    }

    @Test
    void toUserResponse_Works() {
        UserEntity entity = UserEntity.builder()
                .email("test@email.com")
                .fullName("Full Name")
                .dateOfBirth("1990-01-01")
                .build();

        UserResponse response = userMapper.toUserResponse(entity);

        assertThat(response.getEmail()).isEqualTo("test@email.com");
        assertThat(response.getFullName()).isEqualTo("Full Name");
        assertThat(response.getDateOfBirth()).isEqualTo("1990-01-01");
    }
}
