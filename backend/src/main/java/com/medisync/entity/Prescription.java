package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "consultation_id")
    private Consultation consultation;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    private String medicament;

    private String dosage;

    private String frequence;

    private Integer dureeJours;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private boolean renouvellementAutorise = false;

    private Integer nombreRenouvellements = 0;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dateDebut == null) {
            dateDebut = LocalDate.now();
        }
    }
}
