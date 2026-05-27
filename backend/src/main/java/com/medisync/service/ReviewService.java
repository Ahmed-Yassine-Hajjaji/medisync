package com.medisync.service;

import com.medisync.dto.ReviewDTO;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final ConsultationRepository consultationRepository;
    private final MedecinService medecinService;

    public List<ReviewDTO> getReviewsByMedecin(Long medecinId) {
        return reviewRepository.findByMedecinId(medecinId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getReviewsByPatient(Long patientId) {
        return reviewRepository.findByPatientId(patientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDTO createReview(Long patientId, ReviewDTO dto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouve"));

        Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                .orElseThrow(() -> new RuntimeException("Medecin non trouve"));

        Review review = new Review();
        review.setPatient(patient);
        review.setMedecin(medecin);
        review.setNote(dto.getNote());
        review.setCommentaire(dto.getCommentaire());

        if (dto.getConsultationId() != null) {
            Consultation consultation = consultationRepository.findById(dto.getConsultationId())
                    .orElseThrow(() -> new RuntimeException("Consultation non trouvee"));
            review.setConsultation(consultation);
        }

        review = reviewRepository.save(review);

        medecinService.updateNoteMoyenne(medecin.getId());

        return toDTO(review);
    }

    @Transactional
    public void reportReview(Long reviewId, String motif) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Avis non trouve"));
        review.setSignalement(true);
        review.setMotifSignalement(motif);
        reviewRepository.save(review);
    }

    public List<ReviewDTO> getReportedReviews() {
        return reviewRepository.findBySignalementTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ReviewDTO toDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setPatientId(review.getPatient().getId());
        dto.setPatientNom(review.getPatient().getNom() + " " + review.getPatient().getPrenom());
        dto.setMedecinId(review.getMedecin().getId());
        dto.setMedecinNom(review.getMedecin().getNom() + " " + review.getMedecin().getPrenom());
        if (review.getConsultation() != null) {
            dto.setConsultationId(review.getConsultation().getId());
        }
        dto.setNote(review.getNote());
        dto.setCommentaire(review.getCommentaire());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
