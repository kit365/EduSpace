package com.eduspace.accountservice.model.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TwoFactorResponse {
    String secret;
    String qrCodeUrl;
}
