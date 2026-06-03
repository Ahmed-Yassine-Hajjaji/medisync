package com.medisync.controller;

import com.medisync.config.DataInitializer;
import com.medisync.dto.*;
import com.medisync.entity.*;
import com.medisync.repository.SalleConsultationRepository;
import com.medisync.repository.MedecinRepository;
import com.medisync.repository.UserRepository;
import com.medisync.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final PatientService patientService;
    private final MedecinService medecinService;
    private final ReviewService reviewService;
    private final DataInitializer dataInitializer;
    private final SalleConsultationRepository salleRepository;
    private final MedecinRepository medecinRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/medecins")
    public ResponseEntity<List<MedecinDTO>> getAllMedecins() {
        return ResponseEntity.ok(medecinService.getAllMedecins());
    }

    @PostMapping("/medecins")
    public ResponseEntity<MedecinDTO> createMedecin(
            @RequestBody MedecinDTO dto,
            @RequestParam String password) {
        return ResponseEntity.ok(adminService.createMedecin(dto, password));
    }

    @GetMapping("/secretaires")
    public ResponseEntity<List<UserDTO>> getAllSecretaires() {
        return ResponseEntity.ok(adminService.getAllSecretaires());
    }

    @PostMapping("/secretaires")
    public ResponseEntity<UserDTO> createSecretaire(
            @RequestBody UserDTO dto,
            @RequestParam String password,
            @RequestParam(required = false) Long cliniqueId) {
        return ResponseEntity.ok(adminService.createSecretaire(dto, password, cliniqueId));
    }

    @GetMapping("/cliniques")
    public ResponseEntity<List<CliniqueDTO>> getAllCliniques() {
        return ResponseEntity.ok(adminService.getAllCliniques());
    }

    @PostMapping("/cliniques")
    public ResponseEntity<CliniqueDTO> createClinique(@RequestBody CliniqueDTO dto) {
        return ResponseEntity.ok(adminService.createClinique(dto));
    }

    @PutMapping("/cliniques/{id}")
    public ResponseEntity<CliniqueDTO> updateClinique(@PathVariable Long id, @RequestBody CliniqueDTO dto) {
        return ResponseEntity.ok(adminService.updateClinique(id, dto));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<Void> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        adminService.toggleUserStatus(id, enabled);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reviews/reported")
    public ResponseEntity<List<ReviewDTO>> getReportedReviews() {
        return ResponseEntity.ok(reviewService.getReportedReviews());
    }

    @GetMapping("/financial/stats")
    public ResponseEntity<?> getFinancialStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(adminService.getFinancialStats(start, end));
    }

    @GetMapping("/financial/revenue-by-month")
    public ResponseEntity<?> getRevenueByMonth(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(adminService.getRevenueByMonth(start, end));
    }

    @GetMapping("/financial/revenue-by-doctor")
    public ResponseEntity<?> getRevenueByDoctor(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(adminService.getRevenueByDoctor(start, end));
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(adminService.getAllInvoicesForAdmin(start, end));
    }

    @GetMapping("/audit")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate from,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate to) {
        return ResponseEntity.ok(adminService.getAuditLogs(action, from, to));
    }

    @PostMapping("/init-data")
    public ResponseEntity<String> initData() {
        boolean seeded = dataInitializer.seedIfEmpty();
        return ResponseEntity.ok(seeded
                ? "Donnees de demonstration creees"
                : "La base contient deja des donnees");
    }

    // ==================== 2FA ====================

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
    }

    @GetMapping("/2fa/status")
    public ResponseEntity<Map<String, Boolean>> get2FAStatus() {
        User user = getCurrentUser();
        return ResponseEntity.ok(Map.of("enabled", user.isTwoFactorEnabled() && user.getTwoFactorSecret() != null));
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<Map<String, Object>> setup2FA() {
        User user = getCurrentUser();
        String secret = authService.generateTotpSecret();

        String otpAuthUrl = String.format(
                "otpauth://totp/MediSync:%s?secret=%s&issuer=MediSync&algorithm=SHA1&digits=6&period=30",
                user.getEmail(), secret);

        List<String> backupCodes = generateBackupCodes();

        return ResponseEntity.ok(Map.of(
                "secret", secret,
                "qrCodeUrl", otpAuthUrl,
                "backupCodes", backupCodes
        ));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<?> verify2FA(@RequestBody Map<String, String> body) {
        User user = getCurrentUser();
        String code = body.get("code");
        String secret = body.get("secret");

        if (secret == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code et secret requis"));
        }

        if (!authService.verifyTotpCode(secret, code)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code invalide"));
        }

        authService.enableTwoFactor(user.getId(), secret);
        return ResponseEntity.ok(Map.of("message", "2FA activee avec succes"));
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disable2FA(@RequestBody Map<String, String> body) {
        User user = getCurrentUser();
        String code = body.get("code");

        if (user.getTwoFactorSecret() == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code requis"));
        }

        if (!authService.verifyTotpCode(user.getTwoFactorSecret(), code)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code invalide"));
        }

        authService.disableTwoFactor(user.getId());
        return ResponseEntity.ok(Map.of("message", "2FA desactivee"));
    }

    @GetMapping("/2fa/backup-codes")
    public ResponseEntity<Map<String, List<String>>> getBackupCodes() {
        return ResponseEntity.ok(Map.of("codes", generateBackupCodes()));
    }

    @PostMapping("/2fa/regenerate-backup-codes")
    public ResponseEntity<Map<String, List<String>>> regenerateBackupCodes() {
        return ResponseEntity.ok(Map.of("codes", generateBackupCodes()));
    }

    @GetMapping("/2fa/activity")
    public ResponseEntity<List<?>> get2FAActivity() {
        return ResponseEntity.ok(List.of());
    }

    private List<String> generateBackupCodes() {
        SecureRandom random = new SecureRandom();
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            codes.add(String.format("%04d-%04d", random.nextInt(10000), random.nextInt(10000)));
        }
        return codes;
    }

    // ==================== ROOMS ====================

    @GetMapping("/rooms")
    public ResponseEntity<List<SalleDTO>> getAllRooms() {
        List<SalleDTO> rooms = salleRepository.findAll().stream()
                .map(this::toSalleDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/rooms")
    public ResponseEntity<SalleDTO> createRoom(@RequestBody SalleDTO dto) {
        SalleConsultation salle = new SalleConsultation();
        applySalleDTO(salle, dto);
        salle = salleRepository.save(salle);
        return ResponseEntity.ok(toSalleDTO(salle));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<SalleDTO> updateRoom(@PathVariable Long id, @RequestBody SalleDTO dto) {
        SalleConsultation salle = salleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle non trouvee"));
        applySalleDTO(salle, dto);
        salle = salleRepository.save(salle);
        return ResponseEntity.ok(toSalleDTO(salle));
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        salleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/rooms/{id}/assign")
    public ResponseEntity<SalleDTO> assignDoctor(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        SalleConsultation salle = salleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle non trouvee"));
        Long medecinId = body.get("medecinId");
        if (medecinId != null) {
            Medecin medecin = medecinRepository.findById(medecinId)
                    .orElseThrow(() -> new RuntimeException("Medecin non trouve"));
            salle.setMedecinAssigne(medecin);
        } else {
            salle.setMedecinAssigne(null);
        }
        salle = salleRepository.save(salle);
        return ResponseEntity.ok(toSalleDTO(salle));
    }

    @PatchMapping("/rooms/{id}/toggle-availability")
    public ResponseEntity<SalleDTO> toggleRoomAvailability(@PathVariable Long id) {
        SalleConsultation salle = salleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle non trouvee"));
        salle.setDisponible(!salle.isDisponible());
        salle = salleRepository.save(salle);
        return ResponseEntity.ok(toSalleDTO(salle));
    }

    private SalleDTO toSalleDTO(SalleConsultation s) {
        SalleDTO dto = new SalleDTO();
        dto.setId(s.getId());
        dto.setNumero(s.getNumero());
        dto.setNom(s.getNom());
        dto.setType(s.getType() != null ? s.getType().name() : "CONSULTATION");
        dto.setEtage(s.getEtage());
        dto.setCapacite(s.getCapacite());
        dto.setDisponible(s.isDisponible());
        if (s.getEquipements() != null && !s.getEquipements().isBlank()) {
            dto.setEquipements(Arrays.asList(s.getEquipements().split(",")));
        } else {
            dto.setEquipements(List.of());
        }
        if (s.getMedecinAssigne() != null) {
            SalleDTO.MedecinAssigneDTO med = new SalleDTO.MedecinAssigneDTO();
            med.setId(s.getMedecinAssigne().getId());
            med.setNom(s.getMedecinAssigne().getNom());
            med.setPrenom(s.getMedecinAssigne().getPrenom());
            med.setSpecialite(s.getMedecinAssigne().getSpecialite().name());
            dto.setMedecinAssigne(med);
        }
        return dto;
    }

    private void applySalleDTO(SalleConsultation salle, SalleDTO dto) {
        salle.setNumero(dto.getNumero());
        salle.setNom(dto.getNom());
        if (dto.getType() != null) {
            salle.setType(TypeSalle.valueOf(dto.getType()));
        }
        salle.setEtage(dto.getEtage());
        salle.setCapacite(dto.getCapacite());
        if (dto.getEquipements() != null) {
            salle.setEquipements(String.join(",", dto.getEquipements()));
        }
        salle.setDisponible(dto.isDisponible());
    }
}
