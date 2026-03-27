package com.eduspace.apigatewayservice.config;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import com.eduspace.apigatewayservice.common.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.oauth2.server.resource.web.server.authentication.ServerBearerTokenAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private static final ServerBearerTokenAuthenticationConverter DEFAULT_BEARER_CONVERTER =
            new ServerBearerTokenAuthenticationConverter();

    /** SCG/reactive: ưu tiên raw URI path vì pathWithinApplication() đôi khi rỗng/khác. */
    private static String normalizedPath(org.springframework.web.server.ServerWebExchange exchange) {
        String p = exchange.getRequest().getURI().getPath();
        if (p == null || p.isEmpty()) {
            p = exchange.getRequest().getPath().value();
        }
        if (p == null) {
            return "";
        }
        int q = p.indexOf('?');
        if (q >= 0) {
            p = p.substring(0, q);
        }
        return p;
    }

    /**
     * Không đọc Bearer trên các URL đã permitAll: Swagger/UI thường gửi kèm token cũ → JWT fail → 401
     * trước khi tải được /v3/api-docs/... (lỗi "Unauthorized /v3/api-docs/account-service").
     */
    private static boolean shouldIgnoreBearerToken(org.springframework.web.server.ServerWebExchange exchange) {
        String p = normalizedPath(exchange);
        if (p.isEmpty()) {
            return false;
        }
        String pl = p.toLowerCase(Locale.ROOT);
        return pl.startsWith("/api/v1/auth/")
                || "/api/v1/auth".equals(pl)
                // Public room/property APIs are permitAll. Ignore stale bearer to avoid false 401.
                || "/api/v1/properties".equals(pl)
                || pl.startsWith("/api/v1/properties/")
                || "/api/v1/rooms".equals(pl)
                || pl.startsWith("/api/v1/rooms/")
                || "/api/v1/amenities".equals(pl)
                || pl.startsWith("/api/v1/amenities/")
                || "/api/v1/room-categories".equals(pl)
                || pl.startsWith("/api/v1/room-categories/")
                || "/api/v1/reviews".equals(pl)
                || pl.startsWith("/api/v1/reviews/")
                || pl.startsWith("/v3/api-docs")
                || pl.contains("/v3/api-docs")
                || pl.startsWith("/swagger-ui")
                || pl.startsWith("/swagger-resources")
                || pl.startsWith("/webjars/");
    }

    private static final ServerAuthenticationConverter BEARER_TOKEN_CONVERTER_SKIP_PUBLIC =
            exchange -> {
                if (shouldIgnoreBearerToken(exchange)) {
                    return Mono.empty();
                }
                return DEFAULT_BEARER_CONVERTER.convert(exchange);
            };

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:http://localhost:8180/realms/eduspace}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:http://localhost:8180/realms/eduspace/protocol/openid-connect/certs}")
    private String jwkSetUri;

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        // Use JWK set URI but relax issuer validation for local/dev environments.
        NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withJwkSetUri(jwkSetUri).build();
        decoder.setJwtValidator(JwtValidators.createDefault()); // do not enforce `iss`
        return decoder;
    }

    /**
     * Một chain duy nhất: tránh SCG + multi-chain đôi khi chọn sai filter (vẫn 401 dù đã permitAll).
     * {@link #BEARER_TOKEN_CONVERTER_SKIP_PUBLIC} bỏ Bearer trên auth + swagger để token cũ trong trình duyệt không chặn permitAll.
     */
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeExchange(exchanges -> exchanges
                        // Public endpoints - no authentication required
                        .pathMatchers("/api/v1/auth", "/api/v1/auth/**").permitAll()
                        .pathMatchers("/api/v1/public/**").permitAll() // New: make all public sub-paths accessible
                        .pathMatchers("/actuator/**").permitAll()

                        // Room Service public endpoints (Search, Details, etc.)
                        .pathMatchers("/api/v1/rooms", "/api/v1/rooms/**",
                                      "/api/v1/properties", "/api/v1/properties/**",
                                      "/api/v1/amenities", "/api/v1/amenities/**",
                                      "/api/v1/room-categories", "/api/v1/room-categories/**",
                                      "/api/v1/reviews", "/api/v1/reviews/**").permitAll()
                        
                        // Account Service public endpoints
                        .pathMatchers("/api/v1/accounts/public/**").permitAll()

                        // Banks & bank information (guest / public reads like TeddyPet)
                        .pathMatchers(HttpMethod.GET, "/api/v1/banks", "/api/v1/banks/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/bank-information/booking/code/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/v1/bank-information/booking/code/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/bank-information/guest-by-email").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/bank-information/order/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/v1/bank-information/order/code/**").permitAll()

                        // Booking lookup by code (account-service bank flow)
                        .pathMatchers(HttpMethod.GET, "/api/v1/bookings/by-code/**").permitAll()

                        // Conversation Service endpoints - allow guests to start support chats
                        .pathMatchers("/api/v1/conversations/**", "/api/v1/messages/**", "/ws/**").permitAll()
                        .pathMatchers("/media/**").permitAll()

                        // Swagger/OpenAPI (springdoc trên Gateway + proxy tới từng service)
                        .pathMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .pathMatchers("/v3/api-docs", "/v3/api-docs/**").permitAll()
                        .pathMatchers("/swagger-resources/**").permitAll()
                        .pathMatchers("/webjars/**").permitAll()

                        // Host console: deposit/refund policy CRUD (same paths as admin API; not platform-wide admin)
                        .pathMatchers("/api/v1/admin/booking-deposit-refund-policies",
                                      "/api/v1/admin/booking-deposit-refund-policies/**")
                                .hasAnyRole(
                                        Role.HOST.name(),
                                        Role.ADMIN.name(),
                                        Role.SUPER_ADMIN.name())

                        // Admin endpoints require ADMIN or SUPER_ADMIN role
                        .pathMatchers("/api/v1/admin/**", "/api/v1/accounts/admin/**").hasAnyRole(
                                Role.ADMIN.name(),
                                Role.SUPER_ADMIN.name())

                        // All other endpoints require authentication
                        .anyExchange().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenConverter(BEARER_TOKEN_CONVERTER_SKIP_PUBLIC)
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(keycloakJwtConverter())));

        return http.build();
    }

    private Converter<Jwt, Mono<AbstractAuthenticationToken>> keycloakJwtConverter() {
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            java.util.Set<String> allRoles = new java.util.HashSet<>();

            // 1. Extract Realm Roles
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                Object rolesObj = realmAccess.get("roles");
                if (rolesObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<String> roles = (List<String>) rolesObj;
                    allRoles.addAll(roles);
                }
            }

            // 2. Extract Client Roles
            Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
            if (resourceAccess != null) {
                for (Map.Entry<String, Object> entry : resourceAccess.entrySet()) {
                    Object accessObj = entry.getValue();
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
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    .collect(Collectors.toList());
        });

        return new ReactiveJwtAuthenticationConverterAdapter(jwtConverter);
    }

    @Bean
    public org.springframework.web.cors.reactive.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        // FE :5173 + Swagger UI served từ chính gateway :8080
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:8080",
                "http://127.0.0.1:8080"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
