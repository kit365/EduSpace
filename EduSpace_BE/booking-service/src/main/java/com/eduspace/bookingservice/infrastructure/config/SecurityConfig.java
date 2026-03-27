package com.eduspace.bookingservice.infrastructure.config;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final DefaultBearerTokenResolver DEFAULT_BEARER_RESOLVER = new DefaultBearerTokenResolver();

    /**
     * Skip JWT extraction for public booking endpoints so that an expired/invalid
     * Authorization header does not cause 401 on permitAll paths.
     */
    private static boolean isPublicBookingPath(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        if (uri == null) return false;
        int q = uri.indexOf('?');
        if (q >= 0) uri = uri.substring(0, q);
        String u = uri.toLowerCase(Locale.ROOT);

        if ("post".equalsIgnoreCase(method)) {
            return "/api/v1/bookings".equals(u)
                    || "/api/v1/bookings/deposit-intent".equals(u)
                    || u.matches("/api/v1/bookings/deposit-intent/[^/]+/payos")
                    || u.matches("/api/v1/bookings/deposit-intent/[^/]+/confirm")
                    || "/api/v1/payment/payos/webhook".equals(u);
        }
        if ("get".equalsIgnoreCase(method)) {
            return u.matches("/api/v1/bookings/deposit-intent/[^/]+/status")
                    || u.startsWith("/api/v1/bookings/by-code/")
                    || "/api/v1/bookings/public/lookup".equals(u)
                    || "/api/v1/bookings/public/deposit-refund-policies".equals(u);
        }
        return false;
    }

    private static final BearerTokenResolver BEARER_RESOLVER_SKIP_PUBLIC = request -> {
        if (isPublicBookingPath(request)) return null;
        return DEFAULT_BEARER_RESOLVER.resolve(request);
    };

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:http://localhost:8180/realms/eduspace/protocol/openid-connect/certs}")
    private String jwkSetUri;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.disable())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                        .permitAll()
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**")
                        .permitAll()
                        .requestMatchers("/api/v1/bookings/health")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/bookings/by-code/**")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/bookings/public/lookup")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/bookings/public/deposit-refund-policies")
                        .permitAll()
                        // PayOS webhook — called by PayOS servers without auth
                        .requestMatchers("/api/v1/payment/payos/webhook")
                        .permitAll()
                        // Deposit status polling — called by FE after payment
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/bookings/deposit-intent/*/status")
                        .permitAll()
                        // Booking creation and deposit payment — permit all roles including guests
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/bookings")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/bookings/deposit-intent")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/bookings/deposit-intent/*/payos")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/bookings/deposit-intent/*/confirm")
                        .permitAll()
                        .requestMatchers(
                                "/api/v1/admin/booking-deposit-refund-policies",
                                "/api/v1/admin/booking-deposit-refund-policies/**")
                        .hasAnyRole("HOST", "ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/v1/host/checkin-policies", "/api/v1/host/checkin-policies/**")
                        .hasAnyRole("HOST", "ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/v1/bookings/*/refunds")
                        .hasAnyRole("HOST", "ADMIN", "SUPER_ADMIN")
                        .anyRequest()
                        .authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenResolver(BEARER_RESOLVER_SKIP_PUBLIC)
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtConverter())));
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        decoder.setJwtValidator(JwtValidators.createDefault());
        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter keycloakJwtConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            java.util.Set<String> allRoles = new java.util.HashSet<>();
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) realmAccess.get("roles");
                allRoles.addAll(roles);
            }
            Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
            if (resourceAccess != null) {
                for (Object accessObj : resourceAccess.values()) {
                    if (accessObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> clientAccess = (Map<String, Object>) accessObj;
                        if (clientAccess.containsKey("roles")) {
                            Object clientRolesObj = clientAccess.get("roles");
                            if (clientRolesObj instanceof List) {
                                @SuppressWarnings("unchecked")
                                List<String> clientRoles = (List<String>) clientRolesObj;
                                allRoles.addAll(clientRoles);
                            }
                        }
                    }
                }
            }
            return allRoles.stream()
                    .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_"
                            + role.toUpperCase()))
                    .collect(Collectors.toList());
        });
        return converter;
    }
}
