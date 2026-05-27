package com.medisync.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Long id;
    private Long patientId;
    private String patientNom;
    private Long medecinId;
    private String medecinNom;
    private Long consultationId;
    private Integer note;
    private String commentaire;
    private LocalDateTime createdAt;
}
