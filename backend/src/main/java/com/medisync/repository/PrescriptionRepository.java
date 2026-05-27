package com.medisync.repository;

import com.medisync.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientId(Long patientId);
    List<Prescription> findByMedecinId(Long medecinId);
    List<Prescription> findByConsultationId(Long consultationId);

    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId AND p.dateFin >= :date")
    List<Prescription> findActivePrescriptions(Long patientId, LocalDate date);
}
