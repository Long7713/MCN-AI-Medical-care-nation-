package com.mcn.backend.repository;

import com.mcn.backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
}
