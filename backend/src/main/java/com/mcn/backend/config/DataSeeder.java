package com.mcn.backend.config;

import com.mcn.backend.model.Department;
import com.mcn.backend.model.TimeSlot;
import com.mcn.backend.repository.DepartmentRepository;
import com.mcn.backend.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final TimeSlotRepository timeSlotRepository;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() > 0) return;

        List<Department> departments = List.of(
            Department.builder().name("Nội Khoa").description("Khám và điều trị bệnh nội khoa tổng quát").location("Tầng 2 - Phòng 201").build(),
            Department.builder().name("Nội Tiêu Hóa").description("Khám tiêu hóa, dạ dày, đại tràng").location("Tầng 2 - Phòng 202").build(),
            Department.builder().name("Nội Tim Mạch").description("Tim mạch, huyết áp, rối loạn nhịp tim").location("Tầng 3 - Phòng 301").build(),
            Department.builder().name("Tai Mũi Họng").description("Khám và điều trị bệnh tai mũi họng").location("Tầng 3 - Phòng 302").build(),
            Department.builder().name("Xương Khớp").description("Khám cơ xương khớp, cột sống").location("Tầng 4 - Phòng 401").build(),
            Department.builder().name("Ngoại Khoa").description("Phẫu thuật và điều trị ngoại khoa").location("Tầng 4 - Phòng 402").build(),
            Department.builder().name("Da Liễu").description("Khám và điều trị bệnh da liễu").location("Tầng 5 - Phòng 501").build(),
            Department.builder().name("Mắt").description("Khám và điều trị bệnh về mắt").location("Tầng 5 - Phòng 502").build()
        );
        departmentRepository.saveAll(departments);

        List<LocalTime> slotTimes = List.of(
            LocalTime.of(8, 0), LocalTime.of(8, 30),
            LocalTime.of(9, 0), LocalTime.of(9, 30),
            LocalTime.of(10, 0), LocalTime.of(10, 30),
            LocalTime.of(14, 0), LocalTime.of(14, 30),
            LocalTime.of(15, 0), LocalTime.of(15, 30)
        );

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDate dayAfter = LocalDate.now().plusDays(2);

        for (Department dept : departments) {
            for (LocalDate date : List.of(tomorrow, dayAfter)) {
                for (LocalTime time : slotTimes) {
                    timeSlotRepository.save(TimeSlot.builder()
                        .department(dept)
                        .slotDate(date)
                        .startTime(time)
                        .isAvailable(true)
                        .build());
                }
            }
        }
    }
}
