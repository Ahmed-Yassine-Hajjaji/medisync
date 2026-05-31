package com.medisync.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MedicalDocumentDTO {
    private Long id;
    private String nom;
    private String type;
    private String cheminFichier;
    private String typeMime;
    private Long tailleFichier;
    private String description;
    private LocalDateTime dateUpload;
    private String category;
}
