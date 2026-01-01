package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.LoginRequest;
import com.jason.personalmoneyflow.model.dto.request.RegisterRequest;
import com.jason.personalmoneyflow.model.dto.response.AuthResponse;
import com.jason.personalmoneyflow.model.dto.response.UserResponse;
import com.jason.personalmoneyflow.service.AuthService;
import com.jason.personalmoneyflow.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String userEmail = authentication.getName();
        UserResponse user = userService.getUserByEmail(userEmail);
        return ResponseEntity.ok(user);
    }
}
