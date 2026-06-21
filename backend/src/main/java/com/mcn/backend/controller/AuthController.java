package com.mcn.backend.controller;

import com.mcn.backend.dto.LoginRequest;
import com.mcn.backend.dto.RegisterRequest;
import com.mcn.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody @Valid RegisterRequest req) {
        return ResponseEntity.status(201).body(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody @Valid LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/face-enroll")
    public ResponseEntity<Map<String, Object>> faceEnroll(@RequestBody Map<String, Object> body) {
        String phone = SecurityContextHolder.getContext().getAuthentication().getName();
        if (phone == null || phone.equals("anonymousUser")) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Chưa xác thực"));
        }
        @SuppressWarnings("unchecked")
        List<Double> vector = (List<Double>) body.get("faceVector");
        return ResponseEntity.ok(authService.enrollFace(phone, vector));
    }
}
