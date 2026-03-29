package com.westoncodesops.sokoonline.security;


import com.westoncodesops.sokoonline.entities.User;
import com.westoncodesops.sokoonline.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * CustomUserDetailsService — Spring Security's bridge to your User entity.
 *
 * WHY THIS EXISTS:
 * Spring Security doesn't know about your User entity. It works with its own
 * UserDetails interface. This class loads your User from the DB and wraps it
 * in a UserDetails object that Spring understands.
 *
 * It's called during login: Spring Security calls loadUserByUsername(email),
 * gets the UserDetails back, then compares the stored hashed password with
 * what the user typed.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword()) // already BCrypt hashed
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}
