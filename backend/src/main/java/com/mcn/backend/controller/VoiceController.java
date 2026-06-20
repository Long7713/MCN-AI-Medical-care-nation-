package com.mcn.backend.controller;

import com.mcn.backend.dto.VoiceTranscribeRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/voice")
public class VoiceController {

    private static final List<String> MOCK_TRANSCRIPTS = List.of(
            "đau bụng buồn nôn tiêu chảy",
            "đau đầu chóng mặt mệt mỏi khó ngủ",
            "ho khan đau họng sổ mũi sốt nhẹ",
            "đau ngực tức ngực khó thở hồi hộp"
    );

    @PostMapping("/transcribe")
    public ResponseEntity<Map<String, Object>> transcribe(
            @RequestBody VoiceTranscribeRequest request) {
        String transcript = MOCK_TRANSCRIPTS.get(new Random().nextInt(MOCK_TRANSCRIPTS.size()));
        return ResponseEntity.ok(Map.of(
                "transcript", transcript,
                "duration", 3.2,
                "language", "vi",
                "status", "transcribed"
        ));
    }
}
