package com.medisync.repository;

import com.medisync.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByNumeroSecuriteSociale(String numeroSecuriteSociale);
    List<Patient> findByParentId(Long parentId);

    @Query("SELECT p FROM Patient p WHERE LOWER(p.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.prenom) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Patient> searchByNomOrPrenom(String search);
}
