package com.medisync.controller;

import com.medisync.dto.auth.*;
import com.medisync.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/2fa/generate")
    public ResponseEntity<String> generateTotpSecret() {
        return ResponseEntity.ok(authService.generateTotpSecret());
    }

    @GetMapping("/google/mobile")
    public ResponseEntity<AuthResponse> googleMobileAuth(@RequestParam String token) {
        return ResponseEntity.ok(authService.authenticateWithGoogle(token));
    }
}
