package com.medisync.dto;

import lombok.Data;
import java.util.List;

@Data
public class SalleDTO {
    private Long id;
    private String numero;
    private String nom;
    private String type;
    private int etage;
    private int capacite;
    private List<String> equipements;
    private boolean disponible;
    private MedecinAssigneDTO medecinAssigne;

    @Data
    public static class MedecinAssigneDTO {
        private Long id;
        private String nom;
        private String prenom;
        private String specialite;
    }
}
