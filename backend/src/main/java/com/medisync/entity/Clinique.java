package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cliniques")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Clinique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    private String adresse;

    private String ville;

    private String codePostal;

    private String telephone;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String horairesOuverture;

    private String specialitesProposees;

    @OneToMany(mappedBy = "clinique")
    private List<Medecin> medecins = new ArrayList<>();

    @OneToMany(mappedBy = "clinique")
    private List<Secretaire> secretaires = new ArrayList<>();

    @OneToMany(mappedBy = "clinique")
    private List<Admin> admins = new ArrayList<>();

    @OneToMany(mappedBy = "clinique", cascade = CascadeType.ALL)
    private List<SalleConsultation> salles = new ArrayList<>();
}
