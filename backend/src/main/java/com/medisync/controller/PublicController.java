package com.medisync.controller;

import com.medisync.dto.*;
import com.medisync.entity.Specialite;
import com.medisync.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final MedecinService medecinService;
    private final ReviewService reviewService;

    @GetMapping("/medecins")
    public ResponseEntity<List<MedecinDTO>> getAllMedecins() {
        return ResponseEntity.ok(medecinService.getAllMedecins());
    }

    @GetMapping("/medecins/{id}")
    public ResponseEntity<MedecinDTO> getMedecin(@PathVariable Long id) {
        return ResponseEntity.ok(medecinService.getMedecinById(id));
    }

    @GetMapping("/medecins/search")
    public ResponseEntity<List<MedecinDTO>> searchMedecins(@RequestParam String q) {
        return ResponseEntity.ok(medecinService.searchMedecins(q));
    }

    @GetMapping("/medecins/specialite/{specialite}")
    public ResponseEntity<List<MedecinDTO>> getMedecinsBySpecialite(@PathVariable Specialite specialite) {
        return ResponseEntity.ok(medecinService.getMedecinsBySpecialite(specialite));
    }

    @GetMapping("/medecins/filter")
    public ResponseEntity<List<MedecinDTO>> filterMedecins(
            @RequestParam Specialite specialite,
            @RequestParam String ville) {
        return ResponseEntity.ok(medecinService.getMedecinsBySpecialiteAndVille(specialite, ville));
    }

    @GetMapping("/medecins/{id}/creneaux")
    public ResponseEntity<List<CreneauDTO>> getCreneaux(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(medecinService.getCreneauxDisponibles(id, date));
    }

    @GetMapping("/medecins/{id}/reviews")
    public ResponseEntity<List<ReviewDTO>> getMedecinReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewsByMedecin(id));
    }

    @GetMapping("/specialites")
    public ResponseEntity<List<Specialite>> getSpecialites() {
        return ResponseEntity.ok(Arrays.asList(Specialite.values()));
    }
}
