package com.mcn.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mcn.backend.config.JwtUtil;
import com.mcn.backend.dto.LoginRequest;
import com.mcn.backend.dto.RegisterRequest;
import com.mcn.backend.model.Patient;
import com.mcn.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PatientRepository patientRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Map<String, Object> register(RegisterRequest req) {
        if (patientRepo.existsByPhone(req.getPhone()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số điện thoại đã tồn tại");
        if (req.getEmail() != null && patientRepo.existsByEmail(req.getEmail()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");

        Patient patient = Patient.builder()
            .fullName(req.getFullName())
            .phone(req.getPhone())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .dateOfBirth(req.getDateOfBirth())
            .gender(req.getGender())
            .build();
        patientRepo.save(patient);

        return Map.of(
            "success", true,
            "message", "Đăng ký thành công",
            "data", Map.of("userId", patient.getId(), "phone", patient.getPhone())
        );
    }

    public Map<String, Object> login(LoginRequest req) {
        Patient patient = patientRepo.findByPhone(req.getPhone())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Số điện thoại không tồn tại"));

        if (!passwordEncoder.matches(req.getPassword(), patient.getPassword()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mật khẩu không đúng");

        String token = jwtUtil.generateToken(patient.getPhone());
        return Map.of(
            "success", true,
            "data", Map.of(
                "accessToken", token,
                "tokenType", "Bearer",
                "expiresIn", 86400,
                "user", Map.of("userId", patient.getId(), "fullName", patient.getFullName())
            )
        );
    }

    public Map<String, Object> enrollFace(String phone, List<Double> vector) {
        Patient patient = patientRepo.findByPhone(phone)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bệnh nhân"));
        try {
            patient.setFaceVector(new ObjectMapper().writeValueAsString(vector));
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi xử lý vector");
        }
        patientRepo.save(patient);
        return Map.of("success", true, "message", "Đăng ký sinh trắc học thành công");
    }
}
