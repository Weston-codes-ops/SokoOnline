package com.westoncodesops.sokoonline.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CorsConfig — allows your React frontend to talk to Spring Boot.
 *
 * WHAT IS CORS?
 * Browsers enforce a "Same-Origin Policy" — a page on localhost:3000
 * is NOT allowed to make requests to localhost:8080 by default.
 * CORS (Cross-Origin Resource Sharing) is how the server tells the
 * browser "it's ok, I trust requests from that origin."
 *
 * Without this, every Axios call from React gets blocked with:
 *   "Access to XMLHttpRequest blocked by CORS policy"
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")          // Apply to all API routes
                .allowedOrigins(
                        "http://localhost:3000",     // React dev server
                        "http://localhost:5173"      // Vite dev server (if you use Vite)
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")             // Allow all headers including Authorization
                .allowCredentials(true)          // Allow cookies/auth headers
                .maxAge(3600);                   // Cache preflight response for 1 hour
    }
}
