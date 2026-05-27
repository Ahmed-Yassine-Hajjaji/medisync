package com.medisync.dto;

import com.medisync.entity.MotifConsultation;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentCreateRequest {
    private Long patientId;

    @NotNull
    private Long medecinId;

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime heureDebut;

    @NotNull
    private MotifConsultation motif;

    private String notes;
}
