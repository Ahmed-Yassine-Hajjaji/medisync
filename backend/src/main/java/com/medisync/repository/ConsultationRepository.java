package com.medisync.repository;

import com.medisync.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByPatientId(Long patientId);
    List<Consultation> findByMedecinId(Long medecinId);

    @Query("SELECT c FROM Consultation c WHERE c.medecin.id = :medecinId AND c.dateConsultation BETWEEN :startDate AND :endDate")
    List<Consultation> findByMedecinIdAndDateBetween(Long medecinId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT COUNT(c) FROM Consultation c WHERE c.medecin.id = :medecinId")
    Long countByMedecinId(Long medecinId);
}
