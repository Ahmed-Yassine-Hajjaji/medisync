package com.medisync.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MedicalDocumentDTO {
    private Long id;
    private String nom;
    private String filename;
    private String originalName;
    private String type;
    private String cheminFichier;
    private String typeMime;
    private String mimeType;
    private Long tailleFichier;
    private Long size;
    private String description;
    private LocalDateTime dateUpload;
    private String uploadDate;
    private String category;
}
