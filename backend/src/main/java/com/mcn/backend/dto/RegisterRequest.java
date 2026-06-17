package com.mcn.backend.dto;

import com.mcn.backend.model.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Email
    private String email;

    @NotBlank
    @Size(min = 8, message = "Mật khẩu phải ít nhất 8 ký tự")
    private String password;

    private LocalDate dateOfBirth;

    private Gender gender;
}
