package com.medisync.dto;

import lombok.Data;

@Data
public class CliniqueDTO {
    private Long id;
    private String nom;
    private String adresse;
    private String ville;
    private String codePostal;
    private String telephone;
    private String email;
    private String description;
    private String horairesOuverture;
    private String specialitesProposees;
    private Integer nombreMedecins;
}
