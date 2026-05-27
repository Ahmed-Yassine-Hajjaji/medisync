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

    private String equipements;

    private boolean disponible = true;

    @ManyToOne
    @JoinColumn(name = "clinique_id")
    private Clinique clinique;
}
