package com.medisync.dto;

import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DisponibiliteDTO {
    private Long id;
    private Long medecinId;
    private DayOfWeek jourSemaine;
    private LocalDate dateSpecifique;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private boolean estConge;
    private boolean recurrent;
}
