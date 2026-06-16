package com.mcn.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/voice")
public class VoiceController {

    @PostMapping("/transcribe")
    public ResponseEntity<Map<String, Object>> transcribe(
            @RequestParam(value = "audio", required = false) MultipartFile audio,
            @RequestParam(value = "language", required = false, defaultValue = "vi") String language) {
        return ResponseEntity.ok(Map.of());
    }
}
