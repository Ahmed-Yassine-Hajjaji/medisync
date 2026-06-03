package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "salles_consultation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalleConsultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    private String numero;

    @Enumerated(EnumType.STRING)
    private TypeSalle type = TypeSalle.CONSULTATION;

    private int etage = 0;

    private int capacite = 1;

    private String equipements;

    private boolean disponible = true;

    @ManyToOne
    @JoinColumn(name = "clinique_id")
    private Clinique clinique;

    @ManyToOne
    @JoinColumn(name = "medecin_id")
    private Medecin medecinAssigne;
}
