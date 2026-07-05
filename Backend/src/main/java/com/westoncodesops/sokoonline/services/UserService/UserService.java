package com.westoncodesops.sokoonline.services.UserService;

import com.westoncodesops.sokoonline.entities.Cart;
import com.westoncodesops.sokoonline.entities.User;
import com.westoncodesops.sokoonline.enums.AccountStatus;
import com.westoncodesops.sokoonline.enums.Role;
import com.westoncodesops.sokoonline.exceptions.BadRequestException;
import com.westoncodesops.sokoonline.repositories.CartRepository;
import com.westoncodesops.sokoonline.repositories.UserRepository;
import com.westoncodesops.sokoonline.dtos.requests.AdminRegisterRequest;
import com.westoncodesops.sokoonline.dtos.requests.RegisterRequest;
import com.westoncodesops.sokoonline.dtos.response.UserResponse;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService implements UserServiceInterface {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.create-secret:admin-create-secret}")
    private String adminCreateSecret;


    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())){
            throw new BadRequestException("Email already in use: "+ request.email());
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.CUSTOMER)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        userRepository.save(user);

        // Create an empty cart for the new user immediately
        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);

        return toResponse(user);

    }

    @Override
    @Transactional
    public UserResponse createAdmin(AdminRegisterRequest request) {
        String expectedSecret = adminCreateSecret == null ? "" : adminCreateSecret.trim();
        String providedSecret = request.adminSecret() == null ? "" : request.adminSecret().trim();

        if (!expectedSecret.equals(providedSecret)) {
            throw new BadRequestException("Invalid admin creation secret. Expected the value from app.admin.create-secret.");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already in use: " + request.email());
        }

        User admin = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        userRepository.save(admin);

        Cart cart = Cart.builder().user(admin).build();
        cartRepository.save(cart);

        return toResponse(admin);
    }

    @Override
    @Transactional
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return toResponse(user);
    }


    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

}
