package com.medisync.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PrescriptionDTO {
    private Long id;
    private Long consultationId;
    private Long patientId;
    private String patientNom;
    private Long medecinId;
    private String medecinNom;
    private String medicament;
    private String dosage;
    private String frequence;
    private Integer dureeJours;
    private String instructions;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private boolean renouvellementAutorise;
    private Integer nombreRenouvellements;
}
