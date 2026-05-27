package com.medisync.dto;

import com.medisync.entity.Role;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String telephone;
    private Role role;
    private boolean enabled;
    private boolean twoFactorEnabled;
    private LocalDateTime createdAt;
}
