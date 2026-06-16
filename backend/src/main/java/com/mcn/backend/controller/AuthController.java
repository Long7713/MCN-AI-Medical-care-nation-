package com.mcn.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of());
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of());
    }
}
