package com.mcn.backend.service;

import com.mcn.backend.repository.DepartmentRepository;
import com.mcn.backend.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final TimeSlotRepository timeSlotRepository;

    public List<Map<String, Object>> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(dept -> Map.<String, Object>of(
                        "id", dept.getId(),
                        "name", dept.getName(),
                        "description", dept.getDescription() != null ? dept.getDescription() : "",
                        "location", dept.getLocation() != null ? dept.getLocation() : ""
                ))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAvailableSlots(Long departmentId) {
        return timeSlotRepository.findByDepartmentIdAndIsAvailableTrue(departmentId).stream()
                .map(slot -> Map.<String, Object>of(
                        "id", slot.getId(),
                        "date", slot.getSlotDate().toString(),
                        "time", slot.getStartTime().toString(),
                        "isAvailable", slot.getIsAvailable()
                ))
                .collect(Collectors.toList());
    }
}
