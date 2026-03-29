package com.westoncodesops.sokoonline.services.UserService;

import com.westoncodesops.sokoonline.dtos.requests.RegisterRequest;
import com.westoncodesops.sokoonline.dtos.response.UserResponse;

public interface UserServiceInterface {

    UserResponse register(RegisterRequest request);

    UserResponse getUserById(Long id);

}
