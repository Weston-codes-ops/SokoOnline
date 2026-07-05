package com.westoncodesops.sokoonline.controllers;

import com.westoncodesops.sokoonline.dtos.response.UserResponse;
import com.westoncodesops.sokoonline.services.AdminUserService.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserResponse> updateUserRole(@PathVariable Long userId,
                                                       @RequestParam String role,
                                                       @RequestParam Long actorId) {
        return ResponseEntity.ok(adminUserService.updateUserRole(userId, role, actorId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{userId}/status")
    public ResponseEntity<UserResponse> toggleAccountStatus(@PathVariable Long userId,
                                                           @RequestParam String status,
                                                           @RequestParam Long actorId) {
        return ResponseEntity.ok(adminUserService.toggleAccountStatus(userId, status, actorId));
    }
}
