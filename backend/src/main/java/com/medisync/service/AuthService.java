package com.medisync.service;

import com.medisync.dto.auth.*;
import com.medisync.entity.*;
import com.medisync.repository.*;
import com.medisync.security.JwtService;
import com.medisync.security.UserDetailsImpl;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email deja utilise");
        }

        Patient patient = new Patient();
        patient.setEmail(request.getEmail());
        patient.setPassword(passwordEncoder.encode(request.getPassword()));
        patient.setNom(request.getNom());
        patient.setPrenom(request.getPrenom());
        patient.setTelephone(request.getTelephone());
        patient.setRole(Role.PATIENT);
        patient.setDateNaissance(request.getDateNaissance());
        patient.setAdresse(request.getAdresse());
        patient.setNumeroSecuriteSociale(request.getNumeroSecuriteSociale());

        patient = patientRepository.save(patient);

        UserDetailsImpl userDetails = UserDetailsImpl.build(patient);
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .id(patient.getId())
                .email(patient.getEmail())
                .nom(patient.getNom())
                .prenom(patient.getPrenom())
                .role(patient.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        if (user.isTwoFactorEnabled()) {
            if (request.getTotpCode() == null || request.getTotpCode().isEmpty()) {
                return AuthResponse.builder()
                        .requiresTwoFactor(true)
                        .build();
            }
            if (!verifyTotpCode(user.getTwoFactorSecret(), request.getTotpCode())) {
                throw new RuntimeException("Code 2FA invalide");
            }
        }

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("id", user.getId());

        String token = jwtService.generateToken(userDetails, claims);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole())
                .build();
    }

    public String generateTotpSecret() {
        SecretGenerator secretGenerator = new DefaultSecretGenerator();
        return secretGenerator.generate();
    }

    public boolean verifyTotpCode(String secret, String code) {
        CodeVerifier verifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());
        return verifier.isValidCode(secret, code);
    }

    @Transactional
    public AuthResponse authenticateWithGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new RuntimeException("Token Google invalide");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String prenom = (String) payload.get("given_name");
            String nom = (String) payload.get("family_name");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                Patient patient = new Patient();
                patient.setEmail(email);
                patient.setPrenom(prenom != null ? prenom : "");
                patient.setNom(nom != null ? nom : "");
                patient.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                patient.setRole(Role.PATIENT);
                patient.setEnabled(true);
                return patientRepository.save(patient);
            });

            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            Map<String, Object> claims = new HashMap<>();
            claims.put("role", user.getRole().name());
            claims.put("id", user.getId());
            String token = jwtService.generateToken(userDetails, claims);

            return AuthResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .email(user.getEmail())
                    .nom(user.getNom())
                    .prenom(user.getPrenom())
                    .role(user.getRole())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Echec authentification Google: " + e.getMessage());
        }
    }

    @Transactional
    public void enableTwoFactor(Long userId, String secret) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
        user.setTwoFactorSecret(secret);
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
    }
}
