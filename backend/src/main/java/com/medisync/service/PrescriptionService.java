package com.medisync.service;

import com.medisync.dto.PrescriptionDTO;
import com.medisync.entity.Prescription;
import com.medisync.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    public List<PrescriptionDTO> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO getPrescriptionById(Long id) {
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription non trouvee"));
        return toDTO(p);
    }

    public List<PrescriptionDTO> getActivePrescriptions(Long patientId) {
        return prescriptionRepository.findActivePrescriptions(patientId, LocalDate.now()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO requestRenewal(Long prescriptionId) {
        Prescription p = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription non trouvee"));

        if (!p.isRenouvellementAutorise()) {
            throw new RuntimeException("Le renouvellement n'est pas autorise pour cette ordonnance");
        }

        p.setNombreRenouvellements(p.getNombreRenouvellements() + 1);
        p.setDateDebut(LocalDate.now());
        if (p.getDureeJours() != null) {
            p.setDateFin(LocalDate.now().plusDays(p.getDureeJours()));
        }

        prescriptionRepository.save(p);
        return toDTO(p);
    }

    private PrescriptionDTO toDTO(Prescription p) {
        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setId(p.getId());
        dto.setConsultationId(p.getConsultation() != null ? p.getConsultation().getId() : null);
        dto.setPatientId(p.getPatient().getId());
        dto.setPatientNom(p.getPatient().getNom() + " " + p.getPatient().getPrenom());
        dto.setMedecinId(p.getMedecin().getId());
        dto.setMedecinNom(p.getMedecin().getNom() + " " + p.getMedecin().getPrenom());
        dto.setMedicament(p.getMedicament());
        dto.setDosage(p.getDosage());
        dto.setFrequence(p.getFrequence());
        dto.setDureeJours(p.getDureeJours());
        dto.setInstructions(p.getInstructions());
        dto.setDateDebut(p.getDateDebut());
        dto.setDateFin(p.getDateFin());
        dto.setRenouvellementAutorise(p.isRenouvellementAutorise());
        dto.setNombreRenouvellements(p.getNombreRenouvellements());
        return dto;
    }
}
