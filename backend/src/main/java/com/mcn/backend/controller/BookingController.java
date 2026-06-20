package com.mcn.backend.controller;

import com.mcn.backend.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class BookingController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllDepartments() {
        List<Map<String, Object>> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(Map.of("success", true, "data", departments));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<Map<String, Object>> getAvailableSlots(@PathVariable Long id) {
        List<Map<String, Object>> slots = departmentService.getAvailableSlots(id);
        return ResponseEntity.ok(Map.of("success", true, "data", slots));
    }
}
