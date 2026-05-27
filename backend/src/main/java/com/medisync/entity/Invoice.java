package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroFacture;

    @OneToOne
    @JoinColumn(name = "consultation_id")
    private Consultation consultation;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private LocalDate dateFacture;

    private LocalDate dateEcheance;

    private BigDecimal montantTotal;

    private BigDecimal montantPaye = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private StatutPaiement statut = StatutPaiement.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String actes;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String modePaiement;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dateFacture == null) {
            dateFacture = LocalDate.now();
        }
        if (numeroFacture == null) {
            numeroFacture = "FAC-" + System.currentTimeMillis();
        }
    }
}
