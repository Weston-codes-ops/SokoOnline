package com.westoncodesops.sokoonline.services.UserService;

import com.westoncodesops.sokoonline.dtos.requests.RegisterRequest;
import com.westoncodesops.sokoonline.dtos.response.UserResponse;

public interface UserServiceInterface {

    UserService.RegisterResponse register(RegisterRequest request);

    UserService.RegisterResponse createAdmin(com.westoncodesops.sokoonline.dtos.requests.AdminRegisterRequest request);

    UserResponse getUserById(Long id);

}
