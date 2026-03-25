package com.eduspace.accountservice.common;

import com.eduspace.accountservice.common.enums.Role;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CommonTest {

    @Test
    void roleEnum_Works() {
        assertThat(Role.GUEST.getName()).isEqualTo("GUEST");
        assertThat(Role.HOST.getName()).isEqualTo("HOST");
        assertThat(Role.MANAGER.getName()).isEqualTo("MANAGER");
        assertThat(Role.STAFF.getName()).isEqualTo("STAFF");
        assertThat(Role.ADMIN.getName()).isEqualTo("ADMIN");
    }
}
