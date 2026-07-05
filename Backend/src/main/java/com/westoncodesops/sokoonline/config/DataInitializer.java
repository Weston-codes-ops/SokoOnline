package com.westoncodesops.sokoonline.config;

import com.westoncodesops.sokoonline.entities.User;
import com.westoncodesops.sokoonline.enums.AccountStatus;
import com.westoncodesops.sokoonline.enums.Role;
import com.westoncodesops.sokoonline.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            System.out.println("Admin bootstrap is disabled. Use the admin creation endpoint instead.");
        };
    }
}
