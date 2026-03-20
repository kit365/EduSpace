package com.eduspace.roomservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@SpringBootTest(classes = RoomServiceApplication.class)
class RoomServiceApplicationTests {

    @Test
    void contextLoads() {
    }

}
