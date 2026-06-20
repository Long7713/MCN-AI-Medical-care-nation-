package com.mcn.backend.controller;

import com.mcn.backend.config.JwtUtil;
import com.mcn.backend.dto.AppointmentRequest;
import com.mcn.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAppointment(
            @RequestBody AppointmentRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String phone = extractPhone(authHeader);
        if (phone == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Unauthorized"));
        }
        Map<String, Object> result = appointmentService.createAppointment(req, phone);
        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyAppointments(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String phone = extractPhone(authHeader);
        if (phone == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Unauthorized"));
        }
        List<Map<String, Object>> appointments = appointmentService.getMyAppointments(phone);
        return ResponseEntity.ok(Map.of("success", true, "data", appointments));
    }

    private String extractPhone(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.isValid(token)) return null;
        return jwtUtil.extractPhone(token);
    }
}
