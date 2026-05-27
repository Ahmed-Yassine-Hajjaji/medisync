package com.medisync.repository;

import com.medisync.entity.Clinique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CliniqueRepository extends JpaRepository<Clinique, Long> {
    List<Clinique> findByVille(String ville);

    @Query("SELECT c FROM Clinique c WHERE LOWER(c.nom) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Clinique> searchByNom(String search);
}
