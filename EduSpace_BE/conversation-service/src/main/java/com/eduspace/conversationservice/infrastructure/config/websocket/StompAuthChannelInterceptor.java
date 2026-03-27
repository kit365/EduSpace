package com.eduspace.conversationservice.infrastructure.config.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class StompAuthChannelInterceptor implements ChannelInterceptor {
    private static final Logger log = LoggerFactory.getLogger(StompAuthChannelInterceptor.class);

    private final JwtDecoder jwtDecoder;
    private final JwtAuthenticationConverter keycloakJwtConverter;

    public StompAuthChannelInterceptor(JwtDecoder jwtDecoder, JwtAuthenticationConverter keycloakJwtConverter) {
        this.jwtDecoder = jwtDecoder;
        this.keycloakJwtConverter = keycloakJwtConverter;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (accessor.getCommand() == StompCommand.CONNECT) {
            String authHeader = firstHeader(accessor, "Authorization");
            if (authHeader == null || authHeader.isBlank()) {
                authHeader = firstHeader(accessor, "authorization");
            }
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.info("STOMP CONNECT missing Bearer token, checking for Guest ID");
                String guestId = firstHeader(accessor, "X-Guest-ID");
                if (guestId == null) guestId = firstHeader(accessor, "x-guest-id");
                
                if (guestId != null && !guestId.isBlank()) {
                    log.info("Authenticated STOMP session as Guest: {}", guestId);
                    var guestAuth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        guestId, null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_GUEST"))
                    );
                    accessor.setUser(guestAuth);
                    SecurityContextHolder.getContext().setAuthentication(guestAuth);
                }
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

