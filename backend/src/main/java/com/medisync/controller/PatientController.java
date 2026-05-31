package com.medisync.controller;

import com.medisync.dto.*;
import com.medisync.security.UserDetailsImpl;
import com.medisync.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final ConsultationService consultationService;
    private final InvoiceService invoiceService;
    private final ReviewService reviewService;
    private final PrescriptionService prescriptionService;
    private final MedicalDocumentService medicalDocumentService;

    @GetMapping("/profile")
    public ResponseEntity<PatientDTO> getProfile(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(patientService.getPatientById(user.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<PatientDTO> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody PatientDTO dto) {
        return ResponseEntity.ok(patientService.updatePatient(user.getId(), dto));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(user.getId()));
    }

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentDTO> createAppointment(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody AppointmentCreateRequest request) {
        Long targetPatientId = user.getId();
        if (request.getPatientId() != null && !request.getPatientId().equals(user.getId())) {
            boolean isDependant = patientService.getDependants(user.getId()).stream()
                    .anyMatch(d -> d.getId().equals(request.getPatientId()));
            if (!isDependant) {
                throw new RuntimeException("Patient non autorise");
            }
            targetPatientId = request.getPatientId();
        }
        return ResponseEntity.ok(appointmentService.createAppointment(request, targetPatientId));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<AppointmentDTO> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }

    @PutMapping("/appointments/{id}/reschedule")
    public ResponseEntity<AppointmentDTO> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleRequest request) {
        return ResponseEntity.ok(
                appointmentService.rescheduleAppointment(id, request.getNewDate(), request.getNewTimeSlot()));
    }

    @GetMapping("/consultations")
    public ResponseEntity<List<ConsultationDTO>> getMyConsultations(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(consultationService.getConsultationsByPatient(user.getId()));
    }

    @GetMapping("/consultations/{id}")
    public ResponseEntity<ConsultationDTO> getConsultation(@PathVariable Long id) {
        return ResponseEntity.ok(consultationService.getConsultationById(id));
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceDTO>> getMyInvoices(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(invoiceService.getInvoicesByPatient(user.getId()));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ReviewDTO> createReview(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody ReviewDTO dto) {
        return ResponseEntity.ok(reviewService.createReview(user.getId(), dto));
    }

    @PostMapping("/dependants")
    public ResponseEntity<PatientDTO> addDependant(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody PatientDTO dto) {
        return ResponseEntity.ok(patientService.createDependant(user.getId(), dto));
    }

    @GetMapping("/dependants")
    public ResponseEntity<List<PatientDTO>> getDependants(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(patientService.getDependants(user.getId()));
    }

    // ==================== PRESCRIPTIONS ====================

    @GetMapping("/prescriptions")
    public ResponseEntity<List<PrescriptionDTO>> getMyPrescriptions(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(user.getId()));
    }

    @GetMapping("/prescriptions/{id}")
    public ResponseEntity<PrescriptionDTO> getPrescription(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    @PostMapping("/prescriptions/{id}/renewal")
    public ResponseEntity<PrescriptionDTO> requestRenewal(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.requestRenewal(id));
    }

    // ==================== DOCUMENTS ====================

    @GetMapping("/documents")
    public ResponseEntity<List<MedicalDocumentDTO>> getMyDocuments(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(medicalDocumentService.getDocumentsByPatient(user.getId()));
    }

    @PostMapping("/documents/upload")
    public ResponseEntity<MedicalDocumentDTO> uploadDocument(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category) throws IOException {
        return ResponseEntity.ok(medicalDocumentService.uploadDocument(user.getId(), user.getId(), file, category));
    }

    @GetMapping("/documents/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) throws IOException {
        byte[] data = medicalDocumentService.downloadDocument(id);
        String mimeType = medicalDocumentService.getDocumentMimeType(id);
        String fileName = medicalDocumentService.getDocumentName(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(mimeType != null ? mimeType : "application/octet-stream"))
                .body(data);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long id) {
        medicalDocumentService.deleteDocument(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/analyses")
    public ResponseEntity<List<MedicalDocumentDTO>> getMyAnalyses(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(medicalDocumentService.getDocumentsByPatientAndType(
                user.getId(), com.medisync.entity.TypeDocument.RESULTAT_ANALYSE));
    }
}
