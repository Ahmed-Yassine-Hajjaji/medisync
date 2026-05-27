package com.medisync.dto;

import com.medisync.entity.MotifConsultation;
import com.medisync.entity.StatutAppointment;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentDTO {
    private Long id;
    private Long patientId;
    private String patientNom;
    private String patientPrenom;
    private Long medecinId;
    private String medecinNom;
    private String medecinPrenom;
    private String medecinSpecialite;
    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private MotifConsultation motif;
    private String notes;
    private StatutAppointment statut;
}
