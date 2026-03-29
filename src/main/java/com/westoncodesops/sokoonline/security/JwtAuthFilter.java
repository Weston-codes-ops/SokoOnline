package com.westoncodesops.sokoonline.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtAuthFilter — runs on EVERY incoming HTTP request, exactly once.
 *
 * HOW IT WORKS:
 * 1. Check if the request has an "Authorization: Bearer <token>" header
 * 2. If yes, extract and validate the token using JwtUtil
 * 3. If valid, build a Spring Security Authentication object and put it
 *    in the SecurityContext — this tells Spring "this request is authenticated"
 * 4. If no token or invalid token, do nothing — Spring Security will
 *    block the request if the route requires authentication
 *
 * Think of this filter as the bouncer at the door:
 * - Checks your ID (token)
 * - If valid, lets you in and stamps your wrist (sets authentication)
 * - If invalid or missing, just passes you along — the route itself
 *   decides if you need to be stamped to enter
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Token must start with "Bearer " — if not, skip filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Strip "Bearer " prefix to get the raw token
        String token = authHeader.substring(7);

        if (jwtUtil.isTokenValid(token)) {
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
            Long userId = jwtUtil.extractUserId(token);

            // Spring Security needs roles prefixed with "ROLE_"
            // e.g. "ADMIN" becomes "ROLE_ADMIN"
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

            // Build authentication object — this is what Spring Security uses
            // to know who is making the request and what they're allowed to do
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, userId, List.of(authority));

            // Store in SecurityContext — available for the rest of the request lifecycle
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // Always continue the filter chain whether authenticated or not
        filterChain.doFilter(request, response);
    }
}
