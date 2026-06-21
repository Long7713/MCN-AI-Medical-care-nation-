package com.mcn.backend.service;

import com.mcn.backend.dto.AppointmentRequest;
import com.mcn.backend.model.Appointment;
import com.mcn.backend.model.Department;
import com.mcn.backend.model.Patient;
import com.mcn.backend.model.TimeSlot;
import com.mcn.backend.repository.AppointmentRepository;
import com.mcn.backend.repository.DepartmentRepository;
import com.mcn.backend.repository.PatientRepository;
import com.mcn.backend.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PatientRepository patientRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public Map<String, Object> createAppointment(AppointmentRequest req, String patientPhone) {
        Patient patient = patientRepository.findByPhone(patientPhone)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bệnh nhân"));

        TimeSlot slot = timeSlotRepository.findByIdForUpdate(req.getSlotId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khung giờ"));

        if (Boolean.FALSE.equals(slot.getIsAvailable())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khung giờ này đã được đặt");
        }

        Department department = departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khoa"));

        slot.setIsAvailable(false);
        timeSlotRepository.save(slot);

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .department(department)
                .timeSlot(slot)
                .note(req.getNote())
                .build();
        appointmentRepository.save(appointment);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("appointmentId", appointment.getId());
        result.put("department", department.getName());
        result.put("date", slot.getSlotDate().toString());
        result.put("time", slot.getStartTime().toString());
        result.put("status", appointment.getStatus().name());
        return result;
    }

    public List<Map<String, Object>> getMyAppointments(String patientPhone) {
        return appointmentRepository.findByPatientPhoneOrderByCreatedAtDesc(patientPhone).stream()
                .map(appt -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", appt.getId());
                    m.put("departmentName", appt.getDepartment().getName());
                    m.put("slotDate", appt.getTimeSlot().getSlotDate().toString());
                    m.put("startTime", appt.getTimeSlot().getStartTime().toString());
                    m.put("status", appt.getStatus().name());
                    m.put("note", appt.getNote() != null ? appt.getNote() : "");
                    m.put("createdAt", appt.getCreatedAt().toString());
                    return m;
                })
                .collect(Collectors.toList());
    }
}
