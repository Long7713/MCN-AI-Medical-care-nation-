package com.mcn.backend.controller;

import com.mcn.backend.dto.VoiceTranscribeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/voice")
@RequiredArgsConstructor
public class VoiceController {

    private final RestTemplate restTemplate;

    @Value("${app.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @PostMapping("/transcribe")
    public ResponseEntity<Map<String, Object>> transcribe(
            @RequestBody VoiceTranscribeRequest request) {
        try {
            Map<?, ?> aiResponse = restTemplate.postForObject(
                    aiServiceUrl + "/voice/transcribe",
                    Map.of("audioBase64", request.getAudioBase64()),
                    Map.class
            );
            String transcript = aiResponse != null ? (String) aiResponse.get("transcript") : "";
            String status = aiResponse != null ? (String) aiResponse.get("status") : "error";

            if (transcript == null || transcript.isBlank()) {
                return ResponseEntity.ok(Map.of(
                        "transcript", "",
                        "status", status != null ? status : "empty",
                        "language", "vi"
                ));
            }
            return ResponseEntity.ok(Map.of(
                    "transcript", transcript,
                    "status", "ok",
                    "language", "vi"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "transcript", "",
                    "status", "error",
                    "error", e.getMessage()
            ));
        }
    }
}
