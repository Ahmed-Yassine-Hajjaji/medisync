package com.medisync.controller;

import com.medisync.dto.*;
import com.medisync.entity.Role;
import com.medisync.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/secretaire")
@PreAuthorize("hasAnyRole('SECRETAIRE', 'ADMIN')")
@RequiredArgsConstructor
public class SecretaireController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final MedecinService medecinService;
    private final InvoiceService invoiceService;

    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/patients/search")
    public ResponseEntity<List<PatientDTO>> searchPatients(@RequestParam String q) {
        return ResponseEntity.ok(patientService.searchPatients(q));
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<PatientDTO> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<PatientDTO> updatePatient(@PathVariable Long id, @RequestBody PatientDTO dto) {
        return ResponseEntity.ok(patientService.updatePatient(id, dto));
    }

    @PostMapping("/patients")
    public ResponseEntity<PatientDTO> createPatient(
            @RequestBody PatientDTO dto,
            @RequestParam(required = false) String password) {
        return ResponseEntity.ok(patientService.createPatient(dto, password));
    }

    @GetMapping("/medecins")
    public ResponseEntity<List<MedecinDTO>> getAllMedecins() {
        return ResponseEntity.ok(medecinService.getAllMedecins());
    }

    @GetMapping("/medecins/{id}")
    public ResponseEntity<MedecinDTO> getMedecin(@PathVariable Long id) {
        return ResponseEntity.ok(medecinService.getMedecinById(id));
    }

    @GetMapping("/medecins/{id}/creneaux")
    public ResponseEntity<List<CreneauDTO>> getCreneaux(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(medecinService.getCreneauxDisponibles(id, date));
    }

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentCreateRequest request) {
        return ResponseEntity.ok(appointmentService.createAppointment(request, request.getPatientId()));
    }

    @PutMapping("/appointments/{id}/confirm")
    public ResponseEntity<AppointmentDTO> confirmAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(id));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<AppointmentDTO> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }

    @GetMapping("/appointments/medecin/{medecinId}/date/{date}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByMedecinAndDate(
            @PathVariable Long medecinId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByMedecinAndDate(medecinId, date));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from != null && to != null) {
            return ResponseEntity.ok(appointmentService.getAllAppointmentsBetween(from, to));
        }
        LocalDate target = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(appointmentService.getAllAppointmentsByDate(target));
    }

    @PostMapping("/invoices/{consultationId}")
    public ResponseEntity<InvoiceDTO> createInvoice(
            @PathVariable Long consultationId,
            @RequestBody InvoiceDTO dto) {
        return ResponseEntity.ok(invoiceService.createInvoice(consultationId, dto));
    }

    @PostMapping("/invoices/{id}/payment")
    public ResponseEntity<InvoiceDTO> processPayment(
            @PathVariable Long id,
            @RequestParam BigDecimal montant,
            @RequestParam String modePaiement) {
        return ResponseEntity.ok(invoiceService.processPayment(id, montant, modePaiement));
    }

    @GetMapping("/invoices/patient/{patientId}")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByPatient(patientId));
    }

    @GetMapping("/invoices/patient/{patientId}/unpaid")
    public ResponseEntity<List<InvoiceDTO>> getUnpaidInvoices(@PathVariable Long patientId) {
        return ResponseEntity.ok(invoiceService.getUnpaidInvoices(patientId));
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }
}
