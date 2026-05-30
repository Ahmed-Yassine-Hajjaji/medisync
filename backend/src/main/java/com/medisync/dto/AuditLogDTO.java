package com.medisync.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditLogDTO {
    private Long id;
    private String utilisateur;
    private String action;
    private String entite;
    private Long entiteId;
    private String details;
    private String adresseIp;
    private LocalDateTime timestamp;
}
