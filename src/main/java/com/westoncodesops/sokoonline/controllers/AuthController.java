package com.westoncodesops.sokoonline.controllers;


import com.westoncodesops.sokoonline.entities.User;
import com.westoncodesops.sokoonline.repositories.UserRepository;
import com.westoncodesops.sokoonline.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController — handles login and returns a JWT.
 *
 * LOGIN FLOW:
 * 1. Client sends { email, password }
 * 2. AuthenticationManager checks credentials against the DB (via CustomUserDetailsService)
 * 3. If correct, we generate a JWT token and return it
 * 4. Client stores the token (localStorage or memory) and sends it in every future request:
 *      Authorization: Bearer <token>
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // --- DTOs ---
    public record LoginRequest(String email, String password) {}
    public record LoginResponse(String token, String email, String role, Long userId) {}

    /**
     * POST /api/auth/login
     * Public — no token required
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        // This line does the heavy lifting:
        // - Calls CustomUserDetailsService.loadUserByUsername(email)
        // - Compares the provided password with the stored BCrypt hash
        // - Throws BadCredentialsException if wrong — Spring handles the 401 response

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        // Credentials are valid — load the full user to get their ID and role
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate the JWT token — this is what the client will store and send back
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        return ResponseEntity.ok(new LoginResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        ));
    }
}
