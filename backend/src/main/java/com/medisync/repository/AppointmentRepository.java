package com.medisync.repository;

import com.medisync.entity.Appointment;
import com.medisync.entity.StatutAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByMedecinId(Long medecinId);
    List<Appointment> findByMedecinIdAndDate(Long medecinId, LocalDate date);
    List<Appointment> findByPatientIdAndStatut(Long patientId, StatutAppointment statut);

    @Query("SELECT a FROM Appointment a WHERE a.medecin.id = :medecinId AND a.date BETWEEN :startDate AND :endDate")
    List<Appointment> findByMedecinIdAndDateBetween(Long medecinId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT a FROM Appointment a WHERE a.date = :date AND a.statut = :statut AND a.rappelEnvoye24h = false")
    List<Appointment> findAppointmentsForReminder24h(LocalDate date, StatutAppointment statut);

    @Query("SELECT a FROM Appointment a WHERE a.date = :date AND a.statut = :statut AND a.rappelEnvoye1h = false")
    List<Appointment> findAppointmentsForReminder1h(LocalDate date, StatutAppointment statut);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.medecin.id = :medecinId AND a.statut = 'NO_SHOW'")
    Long countNoShowByMedecin(Long medecinId);

    @Query("SELECT a FROM Appointment a WHERE " +
           "CAST(CONCAT(a.date, ' ', a.heureDebut) AS timestamp) BETWEEN :startDateTime AND :endDateTime " +
           "AND a.statut = :statut")
    List<Appointment> findAppointmentsForReminder(LocalDateTime startDateTime, LocalDateTime endDateTime, String statut);

    List<Appointment> findByDateAndStatut(LocalDate date, String statut);
}
