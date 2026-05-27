package com.medisync.dto;

import com.medisync.entity.StatutPaiement;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceDTO {
    private Long id;
    private String numeroFacture;
    private Long consultationId;
    private Long patientId;
    private String patientNom;
    private LocalDate dateFacture;
    private LocalDate dateEcheance;
    private BigDecimal montantTotal;
    private BigDecimal montantPaye;
    private StatutPaiement statut;
    private String actes;
    private String details;
    private String modePaiement;
}
