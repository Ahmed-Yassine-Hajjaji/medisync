package com.medisync.controller;

import com.medisync.dto.*;
import com.medisync.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final PatientService patientService;
    private final MedecinService medecinService;
    private final ReviewService reviewService;

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
}
