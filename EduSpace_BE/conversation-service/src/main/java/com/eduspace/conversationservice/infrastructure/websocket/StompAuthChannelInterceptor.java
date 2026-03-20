package com.eduspace.conversationservice.infrastructure.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;
    private final JwtAuthenticationConverter keycloakJwtConverter;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (accessor.getCommand() == StompCommand.CONNECT) {
            String authHeader = firstHeader(accessor, "Authorization");
            if (authHeader == null || authHeader.isBlank()) {
                authHeader = firstHeader(accessor, "authorization");
            }
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("STOMP CONNECT missing Bearer token");
                return message;
            }

            String tokenValue = authHeader.substring("Bearer ".length()).trim();
            Jwt jwt = jwtDecoder.decode(tokenValue);

            var authentication = keycloakJwtConverter.convert(jwt);
            if (authentication == null) {
                authentication = new JwtAuthenticationToken(jwt);
            }

            accessor.setUser(authentication);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        return message;
    }

    private String firstHeader(StompHeaderAccessor accessor, String name) {
        try {
            return accessor.getFirstNativeHeader(name);
        } catch (Exception e) {
            return null;
        }
    }
}

