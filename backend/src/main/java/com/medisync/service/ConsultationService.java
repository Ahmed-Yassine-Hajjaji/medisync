package com.medisync.service;

import com.medisync.dto.ConsultationDTO;
import com.medisync.dto.PrescriptionDTO;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final PrescriptionRepository prescriptionRepository;

    public List<ConsultationDTO> getConsultationsByPatient(Long patientId) {
        return consultationRepository.findByPatientId(patientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ConsultationDTO> getConsultationsByMedecin(Long medecinId) {
        return consultationRepository.findByMedecinId(medecinId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ConsultationDTO getConsultationById(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation non trouvee"));
        return toDTO(consultation);
    }

    @Transactional
    public ConsultationDTO createConsultation(Long appointmentId, ConsultationDTO dto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouve"));

        Consultation consultation = new Consultation();
        consultation.setAppointment(appointment);
        consultation.setPatient(appointment.getPatient());
        consultation.setMedecin(appointment.getMedecin());
        consultation.setMotif(dto.getMotif());
        consultation.setSymptomes(dto.getSymptomes());
        consultation.setDiagnostic(dto.getDiagnostic());
        consultation.setCompteRendu(dto.getCompteRendu());
        consultation.setRecommandations(dto.getRecommandations());

        consultation = consultationRepository.save(consultation);

        appointment.setStatut(StatutAppointment.TERMINE);
        appointmentRepository.save(appointment);

        return toDTO(consultation);
    }

    @Transactional
    public ConsultationDTO updateConsultation(Long id, ConsultationDTO dto) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation non trouvee"));

        consultation.setMotif(dto.getMotif());
        consultation.setSymptomes(dto.getSymptomes());
        consultation.setDiagnostic(dto.getDiagnostic());
        consultation.setCompteRendu(dto.getCompteRendu());
        consultation.setRecommandations(dto.getRecommandations());

        consultation = consultationRepository.save(consultation);
        return toDTO(consultation);
    }

    @Transactional
    public PrescriptionDTO addPrescription(Long consultationId, PrescriptionDTO dto) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new RuntimeException("Consultation non trouvee"));

        Prescription prescription = new Prescription();
        prescription.setConsultation(consultation);
        prescription.setPatient(consultation.getPatient());
        prescription.setMedecin(consultation.getMedecin());
        prescription.setMedicament(dto.getMedicament());
        prescription.setDosage(dto.getDosage());
        prescription.setFrequence(dto.getFrequence());
        prescription.setDureeJours(dto.getDureeJours());
        prescription.setInstructions(dto.getInstructions());
        prescription.setDateDebut(dto.getDateDebut());
        prescription.setDateFin(dto.getDateFin());
        prescription.setRenouvellementAutorise(dto.isRenouvellementAutorise());

        prescription = prescriptionRepository.save(prescription);
        return toPrescriptionDTO(prescription);
    }

    private ConsultationDTO toDTO(Consultation c) {
        ConsultationDTO dto = new ConsultationDTO();
        dto.setId(c.getId());
        if (c.getAppointment() != null) {
            dto.setAppointmentId(c.getAppointment().getId());
        }
        dto.setPatientId(c.getPatient().getId());
        dto.setPatientNom(c.getPatient().getNom() + " " + c.getPatient().getPrenom());
        dto.setMedecinId(c.getMedecin().getId());
        dto.setMedecinNom(c.getMedecin().getNom() + " " + c.getMedecin().getPrenom());
        dto.setMotif(c.getMotif());
        dto.setSymptomes(c.getSymptomes());
        dto.setDiagnostic(c.getDiagnostic());
        dto.setCompteRendu(c.getCompteRendu());
        dto.setRecommandations(c.getRecommandations());
        dto.setDateConsultation(c.getDateConsultation());
        dto.setPrescriptions(c.getPrescriptions().stream()
                .map(this::toPrescriptionDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private PrescriptionDTO toPrescriptionDTO(Prescription p) {
        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setId(p.getId());
        if (p.getConsultation() != null) {
            dto.setConsultationId(p.getConsultation().getId());
        }
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
