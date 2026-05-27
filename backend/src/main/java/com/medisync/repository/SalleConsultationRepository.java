package com.medisync.repository;

import com.medisync.entity.SalleConsultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SalleConsultationRepository extends JpaRepository<SalleConsultation, Long> {
    List<SalleConsultation> findByCliniqueId(Long cliniqueId);
    List<SalleConsultation> findByCliniqueIdAndDisponibleTrue(Long cliniqueId);
}
