package com.westoncodesops.sokoonline.services.AdminUserService;

import com.westoncodesops.sokoonline.dtos.response.UserResponse;
import com.westoncodesops.sokoonline.entities.AdminAuditLog;
import com.westoncodesops.sokoonline.entities.User;
import com.westoncodesops.sokoonline.enums.AccountStatus;
import com.westoncodesops.sokoonline.enums.Role;
import com.westoncodesops.sokoonline.repositories.AdminAuditLogRepository;
import com.westoncodesops.sokoonline.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final AdminAuditLogRepository adminAuditLogRepository;

    @Transactional
    public UserResponse updateUserRole(Long userId, String requestedRole, Long actorId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Role role = Role.valueOf(requestedRole.toUpperCase());
        user.setRole(role);
        userRepository.save(user);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actorId(actorId)
                .action("UPDATE_ROLE")
                .targetEmail(user.getEmail())
                .details("Role changed to " + role)
                .build());

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public UserResponse toggleAccountStatus(Long userId, String status, Long actorId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        AccountStatus accountStatus = AccountStatus.valueOf(status.toUpperCase());
        user.setAccountStatus(accountStatus);
        userRepository.save(user);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actorId(actorId)
                .action("TOGGLE_STATUS")
                .targetEmail(user.getEmail())
                .details("Account status changed to " + accountStatus)
                .build());

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
