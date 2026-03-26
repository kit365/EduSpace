package com.eduspace.apigatewayservice.config;

import java.net.ConnectException;
import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebExceptionHandler;
import reactor.core.publisher.Mono;

/**
 * Khi upstream (vd. conversation-service :8084) chưa chạy, Netty báo Connection refused.
 * Mặc định Gateway trả 500 + stack trace dài; handler này trả 503 gọn để dev không bị spam ERROR.
 */
@Slf4j
@Component
@Order(-2)
public class UpstreamConnectErrorWebExceptionHandler implements WebExceptionHandler {

    private static final byte[] BODY_JSON = """
            {"success":false,"status":503,"code":"SERVICE_UNAVAILABLE","message":"Upstream service unavailable. For /ws or chat, start conversation-service (default port 8084)."}\
            """.getBytes(StandardCharsets.UTF_8);

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        if (!isDownstreamConnectionRefused(ex)) {
            return Mono.error(ex);
        }

        log.warn(
                "Upstream connection refused (start the target microservice or ignore if you do not need it): {}",
                rootMessage(ex));

        exchange.getResponse().setStatusCode(HttpStatus.SERVICE_UNAVAILABLE);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(BODY_JSON);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    private static boolean isDownstreamConnectionRefused(Throwable ex) {
        for (Throwable t = ex; t != null; t = t.getCause()) {
            if (t instanceof ConnectException) {
                return true;
            }
            String name = t.getClass().getName();
            if (name.contains("AnnotatedConnectException") && containsConnectionRefused(t)) {
                return true;
            }
            if (containsConnectionRefused(t)) {
                return true;
            }
        }
        return false;
    }

    private static boolean containsConnectionRefused(Throwable t) {
        String m = t.getMessage();
        return m != null && m.contains("Connection refused");
    }

    private static String rootMessage(Throwable ex) {
        String m = ex.getMessage();
        return m != null ? m : ex.getClass().getSimpleName();
    }
}
