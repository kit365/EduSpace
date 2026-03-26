package com.eduspace.bookingservice;

import com.eduspace.bookingservice.infrastructure.client.AccountNotificationClient;
import com.eduspace.bookingservice.infrastructure.client.RoomServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=update",
        "spring.cloud.discovery.enabled=false",
        "eureka.client.enabled=false"
})
class BookingServiceApplicationTests {

    @MockBean
    private RoomServiceClient roomServiceClient;

    @MockBean
    private AccountNotificationClient accountNotificationClient;

    @Test
    void contextLoads() {
    }

}
