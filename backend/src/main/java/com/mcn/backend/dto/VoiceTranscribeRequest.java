package com.mcn.backend.dto;

import lombok.Data;

@Data
public class VoiceTranscribeRequest {
    private String audioBase64;
}
