package com.westoncodesops.sokoonline.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

/**
 * SecurityConfig — the master access control list for SokoOnline.
 *
 * This is where you define:
 * - Which endpoints are public (no token needed)
 * - Which need a logged-in user (any role)
 * - Which are admin-only
 *
 * KEY CONCEPT — Stateless sessions:
 * Traditional Spring Security stores a session on the server between requests.
 * With ,JWT we don't do that — every request is self-contained (the token carries
 * the user's identity). So we set session creation to STATELESS.
 */


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF — not needed for stateless REST APIs
                // (CSRF attacks exploit browser session cookies; we use tokens instead)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // No server-side sessions — every request must carry its own token
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ── PUBLIC ROUTES ─────────────────────────────────────────
                        // Anyone can register or login
                        .requestMatchers("/api/users/register", "/api/auth/login").permitAll()

                        // Anyone can browse products and categories (storefront)
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/subcategories/**").permitAll()
                        .requestMatchers("/api/mpesa/callback").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/promotions/**").permitAll()

                        // ── ADMIN ONLY ROUTES ─────────────────────────────────────
                        // Only admins can create, update, or delete products & categories
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/subcategories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/subcategories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/subcategories/**").hasRole("ADMIN")
                        // Admin can update order status
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/status").hasRole("ADMIN")

                        // ── AUTHENTICATED USERS ───────────────────────────────────
                        // Everything else requires a valid token (any role)
                        .anyRequest().authenticated()
                )

                // Register our JWT filter BEFORE Spring's default username/password filter
                // This ensures JWT is checked first on every request
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();

    }

    /**
     * BCrypt password encoder — used in UserServiceImpl to hash passwords.
     * BCrypt automatically salts hashes, making rainbow table attacks useless.
     * Strength 12 is a good balance of security vs performance.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * AuthenticationManager — used by AuthService to validate login credentials.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();

}

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173"
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;




    }
}
