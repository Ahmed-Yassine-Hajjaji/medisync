package com.medisync.dto;

import com.medisync.entity.Specialite;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
public class MedecinDTO extends UserDTO {
    private Specialite specialite;
    private String numeroOrdre;
    private String description;
    private String languesParlees;
    private BigDecimal tarifConsultation;
    private Integer dureeConsultation;
    private String horaires;
    private Double noteMoyenne;
    private Integer nombreAvis;
    private Long cliniqueId;
    private String cliniqueNom;
}
