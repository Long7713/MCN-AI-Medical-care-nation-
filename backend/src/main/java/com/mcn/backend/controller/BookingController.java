package com.mcn.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/booking")
public class BookingController {

    @PostMapping("/suggest-dept")
    public ResponseEntity<Map<String, Object>> suggestDepartment(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of());
    }
}
