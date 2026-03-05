package com.eduspace.accountservice.model.mapper;

import com.eduspace.accountservice.model.dto.response.UserResponse;
import com.eduspace.accountservice.model.entity.UserEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {

    private final UserMapper userMapper = new UserMapper();

    @Test
    void toUserResponse_Works() {
        UserEntity entity = UserEntity.builder()
                .email("test@email.com")
                .fullName("Full Name")
                .build();

        UserResponse response = userMapper.toUserResponse(entity);

        assertThat(response.getEmail()).isEqualTo("test@email.com");
        assertThat(response.getFullName()).isEqualTo("Full Name");
    }
}
