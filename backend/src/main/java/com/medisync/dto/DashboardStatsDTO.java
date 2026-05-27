package com.medisync.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class DashboardStatsDTO {
    private Long totalPatients;
    private Long totalMedecins;
    private Long totalAppointmentsToday;
    private Long totalAppointmentsMonth;
    private Long totalNoShow;
    private BigDecimal revenueMonth;
    private BigDecimal revenueYear;
    private BigDecimal impayesTotal;
    private Double tauxOccupation;
    private Map<String, Long> appointmentsParJour;
    private Map<String, Long> consultationsParMedecin;
    private Map<String, BigDecimal> revenueParMois;
}
