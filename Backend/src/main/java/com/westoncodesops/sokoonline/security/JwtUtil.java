package com.westoncodesops.sokoonline.security;



import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;


/**
 * JwtUtil — the heart of JWT in SokoOnline.
 *
 * WHAT IS A JWT?
 * A JWT (JSON Web Token) is a string with 3 parts separated by dots:
 *
 *   header.payload.signature
 *
 * Example:
 *   eyJhbGciOiJIUzI1NiJ9        ← header  (algorithm used)
 *   .eyJzdWIiOiJ1c2VyQGVtYWlsLmNvbSJ9  ← payload (data: email, role, expiry)
 *   .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← signature (proves it wasn't tampered with)
 *
 * The server creates and signs the token at login.
 * The client sends it in every request header: Authorization: Bearer <token>
 * The server verifies the signature — if valid, it trusts the payload without hitting the DB.
 */
@Component
public class JwtUtil {

    // Secret key loaded from application.yml — never hardcode this
    @Value("${jwt.secret}")
    private String secret;

    // How long tokens last — loaded from application.yml
    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    /**
     * Build the signing key from the secret string.
     * HMAC-SHA256 (HS256) is the algorithm — it uses a single secret key
     * to both sign and verify tokens (symmetric encryption).
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Generate a JWT token for a logged-in user.
     *
     * The payload (called "claims") contains:
     *   - subject: the user's email (used to identify them)
     *   - role: their role (CUSTOMER or ADMIN)
     *   - userId: their DB id (so we don't need to query DB on every request)
     *   - issuedAt: when the token was created
     *   - expiration: when it expires
     */
    public String generateToken(String email, String role, Long userId) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Parse and validate a token, returning its claims (payload).
     * Throws an exception if the token is expired, malformed, or tampered with.
     */
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }

    /**
     * Returns true if the token is valid and not expired.
     */
    public boolean isTokenValid(String token) {
        try {
            extractClaims(token); // throws if invalid
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
