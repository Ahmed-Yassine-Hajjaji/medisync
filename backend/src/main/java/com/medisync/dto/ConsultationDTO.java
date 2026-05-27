package com.medisync.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ConsultationDTO {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientNom;
    private Long medecinId;
    private String medecinNom;
    private String motif;
    private String symptomes;
    private String diagnostic;
    private String compteRendu;
    private String recommandations;
    private LocalDateTime dateConsultation;
    private List<PrescriptionDTO> prescriptions;
}
