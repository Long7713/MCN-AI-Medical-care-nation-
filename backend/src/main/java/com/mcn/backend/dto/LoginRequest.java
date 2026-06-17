package com.mcn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String phone;

    @NotBlank
    private String password;
}
