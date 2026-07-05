package com.westoncodesops.sokoonline.services;

import com.westoncodesops.sokoonline.dtos.response.UserResponse;
import com.westoncodesops.sokoonline.entities.User;
import com.westoncodesops.sokoonline.enums.AccountStatus;
import com.westoncodesops.sokoonline.enums.Role;
import com.westoncodesops.sokoonline.repositories.AdminAuditLogRepository;
import com.westoncodesops.sokoonline.repositories.UserRepository;
import com.westoncodesops.sokoonline.services.AdminUserService.AdminUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdminAuditLogRepository adminAuditLogRepository;

    @InjectMocks
    private AdminUserService adminUserService;

    @Test
    void updateUserRolePromotesUserAndLogsAudit() {
        User existing = User.builder()
                .id(7L)
                .name("Jane")
                .email("jane@example.com")
                .password("hash")
                .role(Role.CUSTOMER)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(userRepository.findById(7L)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = adminUserService.updateUserRole(7L, "ADMIN", 1L);

        assertEquals(Role.ADMIN.name(), response.role());
        assertEquals("jane@example.com", response.email());
        verify(adminAuditLogRepository).save(any());
    }
}
