package com.mcn.backend.dto;

import lombok.Data;

@Data
public class AppointmentRequest {
    private Long departmentId;
    private Long slotId;
    private String note;
}
