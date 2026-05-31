package com.medisync.service;

import com.medisync.dto.AppointmentDTO;
import com.medisync.dto.AppointmentCreateRequest;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final EmailService emailService;

    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByMedecin(Long medecinId) {
        return appointmentRepository.findByMedecinId(medecinId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByMedecinAndDate(Long medecinId, LocalDate date) {
        return appointmentRepository.findByMedecinIdAndDate(medecinId, date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAllAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByDate(date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAllAppointmentsBetween(LocalDate start, LocalDate end) {
        return appointmentRepository.findByDateBetween(start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByMedecinBetweenDates(Long medecinId, LocalDate start, LocalDate end) {
        return appointmentRepository.findByMedecinIdAndDateBetween(medecinId, start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouve"));
        return toDTO(appointment);
    }

    @Transactional
    public AppointmentDTO createAppointment(AppointmentCreateRequest request, Long patientId) {
        Patient patient = patientRepository.findById(patientId != null ? patientId : request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient non trouve"));

        Medecin medecin = medecinRepository.findById(request.getMedecinId())
                .orElseThrow(() -> new RuntimeException("Medecin non trouve"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setMedecin(medecin);
        appointment.setDate(request.getDate());
        appointment.setHeureDebut(request.getHeureDebut());
        Integer dureeObj = medecin.getDureeConsultation();
        int duree = (dureeObj != null) ? dureeObj : 30;
        appointment.setHeureFin(request.getHeureDebut().plusMinutes(duree));
        appointment.setMotif(request.getMotif());
        appointment.setNotes(request.getNotes());
        appointment.setStatut(StatutAppointment.EN_ATTENTE);

        appointment = appointmentRepository.save(appointment);

        try {
            emailService.sendAppointmentConfirmation(appointment);
        } catch (Exception e) {
            // Don't fail the appointment creation if email fails
        }

        return toDTO(appointment);
    }

    @Transactional
    public AppointmentDTO updateAppointmentStatus(Long id, StatutAppointment statut) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouve"));

        appointment.setStatut(statut);
        appointment = appointmentRepository.save(appointment);

        if (statut == StatutAppointment.ANNULE) {
            emailService.sendAppointmentCancellation(appointment);
        }

        return toDTO(appointment);
    }

    @Transactional
    public AppointmentDTO confirmAppointment(Long id) {
        return updateAppointmentStatus(id, StatutAppointment.CONFIRME);
    }

    @Transactional
    public AppointmentDTO cancelAppointment(Long id) {
        return updateAppointmentStatus(id, StatutAppointment.ANNULE);
    }

    @Transactional
    public void markAsNoShow(Long id) {
        updateAppointmentStatus(id, StatutAppointment.NO_SHOW);
    }

    @Transactional
    public AppointmentDTO rescheduleAppointment(Long id, java.time.LocalDate newDate, java.time.LocalTime newTimeSlot) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouve"));

        Integer dureeObj = appointment.getMedecin().getDureeConsultation();
        int duree = (dureeObj != null) ? dureeObj : 30;
        appointment.setDate(newDate);
        appointment.setHeureDebut(newTimeSlot);
        appointment.setHeureFin(newTimeSlot.plusMinutes(duree));
        appointment.setStatut(StatutAppointment.EN_ATTENTE);

        appointment = appointmentRepository.save(appointment);
        try {
            emailService.sendAppointmentConfirmation(appointment);
        } catch (Exception e) {
            // Don't fail the reschedule if email fails
        }

        return toDTO(appointment);
    }

    private AppointmentDTO toDTO(Appointment apt) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(apt.getId());
        dto.setPatientId(apt.getPatient().getId());
        dto.setPatientNom(apt.getPatient().getNom());
        dto.setPatientPrenom(apt.getPatient().getPrenom());
        dto.setMedecinId(apt.getMedecin().getId());
        dto.setMedecinNom(apt.getMedecin().getNom());
        dto.setMedecinPrenom(apt.getMedecin().getPrenom());
        dto.setMedecinSpecialite(apt.getMedecin().getSpecialite().name());
        dto.setDate(apt.getDate());
        dto.setHeureDebut(apt.getHeureDebut());
        dto.setHeureFin(apt.getHeureFin());
        dto.setMotif(apt.getMotif());
        dto.setNotes(apt.getNotes());
        dto.setStatut(apt.getStatut());
        return dto;
    }
}
