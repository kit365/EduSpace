package com.eduspace.conversationservice.business.service;

import org.springframework.web.multipart.MultipartFile;

public interface MediaStorageService {

    String storeImage(MultipartFile file);

    /**
     * @param folder logical folder (Cloudinary folder name, or subpath under local chat-images)
     */
    String storeImage(MultipartFile file, String folder);
}

