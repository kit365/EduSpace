package com.eduspace.accountservice.infrastructure.config;

import com.eduspace.accountservice.common.enums.Role;
import com.eduspace.accountservice.infrastructure.security.InternalApiKeyAuthenticationFilter;
import com.eduspace.accountservice.presentation.constants.AdminPaths;
import com.eduspace.accountservice.presentation.constants.AuthPaths;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.HttpMethod;
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
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    /** Ignore Authorization on auth API so invalid JWT never blocks login (backup for the auth-only chain). */
    private static final BearerTokenResolver BEARER_RESOLVER_SKIP_AUTH = new BearerTokenResolver() {
        private final DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();

        @Override
        public String resolve(HttpServletRequest request) {
            if (isPublicJwtBypassPath(request)) {
                return null;
            }
            return delegate.resolve(request);
        }

        /** Giống API gateway: swagger + auth công khai — tránh Bearer cũ chặn OpenAPI/UI. */
        private boolean isPublicJwtBypassPath(HttpServletRequest request) {
            String uri = request.getRequestURI();
            if (uri == null) {
                return false;
            }
            int q = uri.indexOf('?');
            if (q >= 0) {
                uri = uri.substring(0, q);
            }
            String u = uri.toLowerCase(Locale.ROOT);
            return u.startsWith("/api/v1/auth/")
                    || "/api/v1/auth".equals(u)
                    || u.startsWith("/v3/api-docs")
                    || u.contains("/v3/api-docs")
                    || u.startsWith("/swagger-ui")
                    || u.startsWith("/swagger-resources")
                    || u.startsWith("/webjars/");
        }
    };

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:http://localhost:8180/realms/eduspace/protocol/openid-connect/certs}")
    private String jwkSetUri;

    @Bean
    @Order(1)
    public SecurityFilterChain internalSecurityFilterChain(
            HttpSecurity http, InternalApiKeyAuthenticationFilter internalApiKeyAuthenticationFilter) throws Exception {
        http.securityMatcher("/api/v1/internal/**")
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .addFilterBefore(internalApiKeyAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * Same as gateway: no JWT filter on auth routes so a stale {@code Authorization} header
     * cannot block login/register before the controller runs.
     */
    @Bean
    @Order(2)
    public SecurityFilterChain authPublicSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher(AuthPaths.BASE_PATH, AuthPaths.BASE_PATH + "/**")
                .cors(cors -> cors.disable())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    @Order(3)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.disable())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        // Bắt buộc khi chain riêng /api/v1/auth/** không được chọn: resolver đã bỏ JWT nhưng user vẫn
                        // anonymous — nếu thiếu permitAll thì anyRequest().authenticated() → 401 {"message":"Unauthorized"}.
                        .requestMatchers("/api/v1/auth", "/api/v1/auth/**").permitAll()
                        .requestMatchers("/v3/api-docs", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                                "/swagger-resources/**", "/webjars/**")
                        .permitAll()
                        .requestMatchers("/api/v1/accounts/public/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/banks", "/api/v1/banks/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/bank-information/booking/code/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/bank-information/booking/code/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/bank-information/guest-by-email")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/bank-information/order/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/bank-information/order/code/**")
                        .permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api/v1/accounts/admin/**").hasAnyRole(
                                Role.ADMIN.name(),
                                Role.SUPER_ADMIN.name())
                        .requestMatchers("/api/v1/accounts/host-applications/admin/**").hasAnyRole(
                                Role.ADMIN.name(),
                                Role.SUPER_ADMIN.name())
                        .requestMatchers(AdminPaths.BASE_PATH + "/**").hasAnyRole(
                                Role.ADMIN.name(),
                                Role.SUPER_ADMIN.name())
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenResolver(BEARER_RESOLVER_SKIP_AUTH)
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(keycloakJwtConverter())));
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

            List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = allRoles.stream()
                    .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(
                            "ROLE_" + role.toUpperCase()))
                    .collect(Collectors.toList());

            return (java.util.Collection<org.springframework.security.core.GrantedAuthority>)
                    (java.util.Collection<?>) authorities;
        });
        return converter;
    }
}
