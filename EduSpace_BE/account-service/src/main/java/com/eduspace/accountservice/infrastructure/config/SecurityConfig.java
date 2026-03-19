package com.eduspace.accountservice.infrastructure.config;

import com.eduspace.accountservice.common.enums.Role;
import com.eduspace.accountservice.presentation.constants.AdminPaths;
import com.eduspace.accountservice.presentation.constants.AuthPaths;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:http://localhost:8180/realms/eduspace/protocol/openid-connect/certs}")
    private String jwkSetUri;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.disable())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(AuthPaths.BASE_PATH + "/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                                "/swagger-resources/**")
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
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(keycloakJwtConverter())));
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // Relax issuer validation for local/dev stability; still validates signature and exp.
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        decoder.setJwtValidator(JwtValidators.createDefault());
        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter keycloakJwtConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            java.util.Set<String> allRoles = new java.util.HashSet<>();

            // 1. Extract Realm Roles
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) realmAccess.get("roles");
                allRoles.addAll(roles);
            }

            // 2. Extract Client Roles (resource_access.<client_id>.roles)
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

            System.out.println("DEBUG: Consolidated Keycloak Roles: " + allRoles);

            List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = allRoles.stream()
                    .map(role -> {
                        String authority = "ROLE_" + role.toUpperCase();
                        System.out.println("DEBUG: Mapping role '" + role + "' to authority '" + authority + "'");
                        return new org.springframework.security.core.authority.SimpleGrantedAuthority(authority);
                    })
                    .collect(Collectors.toList());
            
            System.out.println("DEBUG: Final Authorities List: " + authorities);
            return (java.util.Collection<org.springframework.security.core.GrantedAuthority>) (java.util.Collection<?>) authorities;
        });
        return converter;
    }
}
