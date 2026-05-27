package com.medisync.repository;

import com.medisync.entity.Secretaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SecretaireRepository extends JpaRepository<Secretaire, Long> {
    Optional<Secretaire> findByEmail(String email);
    List<Secretaire> findByCliniqueId(Long cliniqueId);
}
