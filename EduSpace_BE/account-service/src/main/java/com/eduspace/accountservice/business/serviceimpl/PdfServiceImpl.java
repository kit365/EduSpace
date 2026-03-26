package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.PdfService;
import org.xhtmlrenderer.pdf.ITextRenderer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfServiceImpl implements PdfService {

    private final TemplateEngine templateEngine;

    @Override
    public byte[] generatePdfFromTemplate(String templateName, Map<String, Object> data) {
        try {
            Context context = new Context();
            context.setVariables(data);
            String htmlContent = templateEngine.process(templateName, context);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF from template {}: {}", templateName, e.getMessage(), e);
            throw new RuntimeException("Could not generate PDF", e);
        }
    }
}
