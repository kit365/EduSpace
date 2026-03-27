package com.eduspace.accountservice.business.service;

import java.util.Map;

public interface PdfService {
    byte[] generatePdfFromTemplate(String templateName, Map<String, Object> data);
}
