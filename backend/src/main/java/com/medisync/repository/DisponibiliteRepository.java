package com.medisync.repository;

import com.medisync.entity.Disponibilite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {
    List<Disponibilite> findByMedecinId(Long medecinId);
    List<Disponibilite> findByMedecinIdAndJourSemaine(Long medecinId, DayOfWeek jourSemaine);
    List<Disponibilite> findByMedecinIdAndDateSpecifique(Long medecinId, LocalDate date);

    @Query("SELECT d FROM Disponibilite d WHERE d.medecin.id = :medecinId AND d.recurrent = true")
    List<Disponibilite> findRecurrentByMedecinId(Long medecinId);

    @Query("SELECT d FROM Disponibilite d WHERE d.medecin.id = :medecinId AND d.estConge = true AND d.dateSpecifique BETWEEN :startDate AND :endDate")
    List<Disponibilite> findCongesByMedecinIdAndDateBetween(Long medecinId, LocalDate startDate, LocalDate endDate);
}
