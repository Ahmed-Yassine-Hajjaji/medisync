package com.medisync.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class PatientDTO extends UserDTO {
    private LocalDate dateNaissance;
    private String adresse;
    private String numeroSecuriteSociale;
    private String groupeSanguin;
    private String allergies;
    private String antecedents;
    private Long parentId;
}
