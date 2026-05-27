package com.medisync.repository;

import com.medisync.entity.Medecin;
import com.medisync.entity.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long> {
    Optional<Medecin> findByEmail(String email);
    List<Medecin> findBySpecialite(Specialite specialite);
    List<Medecin> findByCliniqueId(Long cliniqueId);

    @Query("SELECT m FROM Medecin m WHERE m.specialite = :specialite AND m.clinique.ville = :ville")
    List<Medecin> findBySpecialiteAndVille(Specialite specialite, String ville);

    @Query("SELECT m FROM Medecin m WHERE LOWER(m.languesParlees) LIKE LOWER(CONCAT('%', :langue, '%'))")
    List<Medecin> findByLangue(String langue);

    @Query("SELECT m FROM Medecin m WHERE LOWER(m.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.prenom) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Medecin> searchByNomOrPrenom(String search);
}
