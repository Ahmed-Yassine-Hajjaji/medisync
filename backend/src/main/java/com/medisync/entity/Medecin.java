package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medecins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Medecin extends User {

    @Enumerated(EnumType.STRING)
    private Specialite specialite;

    private String numeroOrdre;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String languesParlees;

    private BigDecimal tarifConsultation;

    private Integer dureeConsultation = 30;

    @Column(columnDefinition = "TEXT")
    private String horaires;

    private Double notemoyenne = 0.0;

    private Integer nombreAvis = 0;

    @ManyToOne
    @JoinColumn(name = "clinique_id")
    private Clinique clinique;

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL)
    private List<Disponibilite> disponibilites = new ArrayList<>();

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL)
    private List<Consultation> consultations = new ArrayList<>();

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL)
    private List<Review> reviews = new ArrayList<>();

    /** Tarif minimum applicable par la clinique (150 DH). */
    public static final BigDecimal TARIF_MINIMUM = new BigDecimal("150.00");

    @PrePersist
    @PreUpdate
    private void enforceTarifMinimum() {
        if (tarifConsultation == null || tarifConsultation.compareTo(TARIF_MINIMUM) < 0) {
            tarifConsultation = TARIF_MINIMUM;
        }
    }
}
