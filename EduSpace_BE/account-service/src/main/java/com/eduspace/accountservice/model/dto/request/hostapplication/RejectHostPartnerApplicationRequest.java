package com.eduspace.accountservice.model.dto.request.hostapplication;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RejectHostPartnerApplicationRequest {

    String adminNote;
}
