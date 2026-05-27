package com.medisync.dto.auth;

import com.medisync.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule, un chiffre et un caractere special")
    private String password;

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    private String telephone;

    private Role role = Role.PATIENT;

    private LocalDate dateNaissance;

    private String adresse;

    private String numeroSecuriteSociale;
}
