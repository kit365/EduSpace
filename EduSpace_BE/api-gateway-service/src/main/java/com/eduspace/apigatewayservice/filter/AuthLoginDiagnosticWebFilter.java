package com.eduspace.apigatewayservice.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Log chẩn đoán cho POST /api/v1/auth/login: chạy rất sớm (trước Spring Security trong chuỗi WebFilter).
 * Giúp phân biệt 401 do Gateway Security vs do upstream (account-service) qua log trước/sau request.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AuthLoginDiagnosticWebFilter implements WebFilter {
    private static final Logger log = LoggerFactory.getLogger(AuthLoginDiagnosticWebFilter.class);

    private static final String LOGIN_SUFFIX = "/api/v1/auth/login";

    private static boolean isLoginPost(ServerWebExchange exchange) {
        if (!HttpMethod.POST.matches(exchange.getRequest().getMethod().name())) {
            return false;
        }
        String path = exchange.getRequest().getURI().getPath();
        return path != null && LOGIN_SUFFIX.equals(path);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (!isLoginPost(exchange)) {
            return chain.filter(exchange);
        }
        boolean authHeader = exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION);
        log.info(
                "[AUTH-DIAG][gateway] --> POST {} from={} AuthorizationHeaderPresent={}",
                exchange.getRequest().getURI().getPath(),
                exchange.getRequest().getRemoteAddress(),
                authHeader);

        return chain.filter(exchange)
                .then(Mono.fromRunnable(() -> log.info(
                        "[AUTH-DIAG][gateway] <-- POST {} status={}",
                        exchange.getRequest().getURI().getPath(),
                        exchange.getResponse().getStatusCode())));
    }
}
