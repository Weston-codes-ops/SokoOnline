package com.westoncodesops.sokoonline.services.UserService;

import com.westoncodesops.sokoonline.entities.Cart;
import com.westoncodesops.sokoonline.entities.User;
import com.westoncodesops.sokoonline.enums.Role;
import com.westoncodesops.sokoonline.exceptions.BadRequestException;
import com.westoncodesops.sokoonline.repositories.CartRepository;
import com.westoncodesops.sokoonline.repositories.UserRepository;
import com.westoncodesops.sokoonline.dtos.requests.RegisterRequest;
import com.westoncodesops.sokoonline.dtos.response.UserResponse;
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
                .build();
        userRepository.save(user);

        // Create an empty cart for the new user immediately
        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);

        return toResponse(user);

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
