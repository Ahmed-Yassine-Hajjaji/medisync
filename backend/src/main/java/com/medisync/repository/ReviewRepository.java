package com.medisync.repository;

import com.medisync.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMedecinId(Long medecinId);
    List<Review> findByPatientId(Long patientId);
    List<Review> findBySignalementTrue();

    @Query("SELECT AVG(r.note) FROM Review r WHERE r.medecin.id = :medecinId")
    Double getAverageNoteByMedecinId(Long medecinId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.medecin.id = :medecinId")
    Long countByMedecinId(Long medecinId);
}
