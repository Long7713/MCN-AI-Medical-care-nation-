package com.mcn.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAppointment(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of());
    }
}
