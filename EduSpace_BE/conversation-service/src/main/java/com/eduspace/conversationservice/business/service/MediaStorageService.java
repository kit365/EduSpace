package com.eduspace.conversationservice.business.service;

import org.springframework.web.multipart.MultipartFile;

public interface MediaStorageService {
    String storeImage(MultipartFile file);
}

