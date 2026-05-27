package com.medisync.security;

import com.medisync.entity.Patient;
import com.medisync.entity.Role;
import com.medisync.entity.User;
import com.medisync.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${APP_URL:http://localhost:4200}")
    private String appUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");
        String googleId = oAuth2User.getAttribute("sub");

        log.info("OAuth2 login successful for email: {}", email);

        // Find or create user
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewPatientFromOAuth(email, firstName, lastName, googleId));

        // Generate JWT token
        String token = jwtService.generateToken(user);

        // Redirect to frontend with token
        String redirectUrl = String.format("%s/oauth/callback?token=%s", appUrl, token);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private User createNewPatientFromOAuth(String email, String firstName, String lastName, String googleId) {
        Patient patient = new Patient();
        patient.setEmail(email);
        patient.setPrenom(firstName != null ? firstName : "");
        patient.setNom(lastName != null ? lastName : "");
        patient.setPassword(UUID.randomUUID().toString()); // Random password since they use OAuth
        patient.setRole(Role.PATIENT);
        patient.setEnabled(true);
        patient.setNumeroSecu(""); // To be filled later

        log.info("Creating new patient from OAuth: {}", email);
        return userRepository.save(patient);
    }
}
