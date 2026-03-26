package com.eduspace.accountservice.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class InternalApiKeyAuthenticationFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Internal-Api-Key";

    @Value("${app.internal.api-key:}")
    private String expectedKey;

    /**
     * Bean này được Spring Boot đăng ký như servlet filter cho mọi URL. Không override thì login và
     * toàn bộ API trả 401 vì thiếu {@value #HEADER} — chỉ áp dụng cho {@code /api/v1/internal/**}.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !isInternalApiPath(request);
    }

    private static boolean isInternalApiPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri == null) {
            return false;
        }
        int q = uri.indexOf('?');
        if (q >= 0) {
            uri = uri.substring(0, q);
        }
        String contextPath = request.getContextPath();
        if (StringUtils.hasText(contextPath) && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }
        return uri.startsWith("/api/v1/internal/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!StringUtils.hasText(expectedKey)) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Internal API key not configured\"}");
            return;
        }
        String header = request.getHeader(HEADER);
        if (!expectedKey.equals(header)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Unauthorized\"}");
            return;
        }
        var auth = new UsernamePasswordAuthenticationToken(
                "internal-service",
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE")));
        SecurityContextHolder.getContext().setAuthentication(auth);
        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
