package com.eduspace.apigatewayservice.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Slf4j
@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static boolean isNoisyRead(ServerHttpRequest request) {
        if (!"GET".equals(request.getMethod().name())) {
            return false;
        }
        String path = request.getURI().getPath();
        return path != null
                && (path.equals("/api/v1/conversations")
                || path.startsWith("/api/v1/conversations/")
                || path.equals("/api/v1/messages"));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        boolean noisyRead = isNoisyRead(request);

        if (noisyRead) {
            log.debug("==> Gateway Request: {} {} from {}",
                    request.getMethod(),
                    request.getURI().getPath(),
                    request.getRemoteAddress());
        } else {
            log.info("==> Gateway Request: {} {} from {}",
                    request.getMethod(),
                    request.getURI().getPath(),
                    request.getRemoteAddress());
        }

        if (request.getHeaders().getFirst("Authorization") != null) {
            log.debug("    Authorization header present");
        }

        return chain.filter(exchange)
                .then(Mono.fromRunnable(() -> {
                    if (noisyRead) {
                        log.debug("<== Gateway Response: {} for {} {}",
                                exchange.getResponse().getStatusCode(),
                                request.getMethod(),
                                request.getURI().getPath());
                    } else {
                        log.info("<== Gateway Response: {} for {} {}",
                                exchange.getResponse().getStatusCode(),
                                request.getMethod(),
                                request.getURI().getPath());
                    }
                }));
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
