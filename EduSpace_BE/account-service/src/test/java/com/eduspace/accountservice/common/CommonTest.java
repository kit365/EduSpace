package com.eduspace.accountservice.common;

import com.eduspace.accountservice.common.enums.Role;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CommonTest {

    @Test
    void roleEnum_Works() {
        assertThat(Role.STUDENT.getName()).isEqualTo("STUDENT");
        assertThat(Role.TUTOR.getName()).isEqualTo("TUTOR");
        assertThat(Role.ADMIN.getName()).isEqualTo("ADMIN");
    }
}
