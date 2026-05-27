package com.medisync.controller;

import com.medisync.dto.*;
import com.medisync.security.UserDetailsImpl;
import com.medisync.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medecin")
@PreAuthorize("hasAnyRole('MEDECIN', 'ADMIN')")
@RequiredArgsConstructor
public class MedecinController {

    private final MedecinService medecinService;
    private final AppointmentService appointmentService;
    private final ConsultationService consultationService;
    private final PatientService patientService;

    @GetMapping("/profile")
    public ResponseEntity<MedecinDTO> getProfile(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(medecinService.getMedecinById(user.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<MedecinDTO> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody MedecinDTO dto) {
        return ResponseEntity.ok(medecinService.updateMedecin(user.getId(), dto));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByMedecin(user.getId()));
    }

    @GetMapping("/appointments/date/{date}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDate(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByMedecinAndDate(user.getId(), date));
    }

    @GetMapping("/appointments/range")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByRange(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByMedecinBetweenDates(user.getId(), start, end));
    }

    @PutMapping("/appointments/{id}/confirm")
    public ResponseEntity<AppointmentDTO> confirmAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(id));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<AppointmentDTO> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }

    @PutMapping("/appointments/{id}/no-show")
    public ResponseEntity<Void> markNoShow(@PathVariable Long id) {
        appointmentService.markAsNoShow(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/disponibilites")
    public ResponseEntity<List<DisponibiliteDTO>> getDisponibilites(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(medecinService.getDisponibilites(user.getId()));
    }

    @PostMapping("/disponibilites")
    public ResponseEntity<DisponibiliteDTO> addDisponibilite(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody DisponibiliteDTO dto) {
        return ResponseEntity.ok(medecinService.addDisponibilite(user.getId(), dto));
    }

    @PostMapping("/consultations/{appointmentId}")
    public ResponseEntity<ConsultationDTO> createConsultation(
            @PathVariable Long appointmentId,
            @RequestBody ConsultationDTO dto) {
        return ResponseEntity.ok(consultationService.createConsultation(appointmentId, dto));
    }

    @PutMapping("/consultations/{id}")
    public ResponseEntity<ConsultationDTO> updateConsultation(
            @PathVariable Long id,
            @RequestBody ConsultationDTO dto) {
        return ResponseEntity.ok(consultationService.updateConsultation(id, dto));
    }

    @PostMapping("/consultations/{consultationId}/prescriptions")
    public ResponseEntity<PrescriptionDTO> addPrescription(
            @PathVariable Long consultationId,
            @RequestBody PrescriptionDTO dto) {
        return ResponseEntity.ok(consultationService.addPrescription(consultationId, dto));
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<PatientDTO> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @GetMapping("/patients/search")
    public ResponseEntity<List<PatientDTO>> searchPatients(@RequestParam String q) {
        return ResponseEntity.ok(patientService.searchPatients(q));
    }

    @GetMapping("/consultations")
    public ResponseEntity<List<ConsultationDTO>> getMyConsultations(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(consultationService.getConsultationsByMedecin(user.getId()));
    }
}
