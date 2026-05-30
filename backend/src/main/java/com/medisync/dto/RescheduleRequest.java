package com.medisync.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RescheduleRequest {
    private LocalDate newDate;
    private LocalTime newTimeSlot;
}
