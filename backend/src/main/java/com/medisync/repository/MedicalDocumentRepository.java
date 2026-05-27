package com.medisync.repository;

import com.medisync.entity.MedicalDocument;
import com.medisync.entity.TypeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, Long> {
    List<MedicalDocument> findByPatientId(Long patientId);
    List<MedicalDocument> findByPatientIdAndType(Long patientId, TypeDocument type);
}
