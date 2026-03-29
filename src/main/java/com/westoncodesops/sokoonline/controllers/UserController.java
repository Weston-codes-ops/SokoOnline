package com.westoncodesops.sokoonline.controllers;

import com.westoncodesops.sokoonline.dtos.requests.RegisterRequest;
import com.westoncodesops.sokoonline.dtos.response.UserResponse;
import com.westoncodesops.sokoonline.services.UserService.UserServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserServiceInterface userService;

    /**
     * POST /api/users/register
     * Public — anyone can register
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity.status(CREATED).body(response);
    }

    /**
     * GET /api/users/{id}
     * Protected — user can only fetch their own profile (enforce in security config)
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

}
