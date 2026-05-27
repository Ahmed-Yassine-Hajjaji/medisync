package com.medisync.service;

import com.medisync.entity.Appointment;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class EmailService {

    private final OkHttpClient client = new OkHttpClient();
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    @Async
    public void sendAppointmentConfirmation(Appointment appointment) {
        String subject = "Confirmation de votre rendez-vous - MediSync";
        String html = String.format(
            "<h2>Bonjour %s %s,</h2>" +
            "<p>Votre rendez-vous a ete enregistre avec succes.</p>" +
            "<h3>Details:</h3>" +
            "<ul>" +
            "<li><strong>Date:</strong> %s</li>" +
            "<li><strong>Heure:</strong> %s</li>" +
            "<li><strong>Medecin:</strong> Dr. %s %s</li>" +
            "<li><strong>Motif:</strong> %s</li>" +
            "</ul>" +
            "<p>Cordialement,<br>L'equipe MediSync</p>",
            appointment.getPatient().getPrenom(),
            appointment.getPatient().getNom(),
            appointment.getDate(),
            appointment.getHeureDebut(),
            appointment.getMedecin().getPrenom(),
            appointment.getMedecin().getNom(),
            appointment.getMotif()
        );
        sendEmail(appointment.getPatient().getEmail(), subject, html);
    }

    @Async
    public void sendAppointmentCancellation(Appointment appointment) {
        String subject = "Annulation de votre rendez-vous - MediSync";
        String html = String.format(
            "<h2>Bonjour %s %s,</h2>" +
            "<p>Votre rendez-vous du <strong>%s</strong> a <strong>%s</strong> a ete annule.</p>" +
            "<p>N'hesitez pas a reprendre rendez-vous sur notre plateforme.</p>" +
            "<p>Cordialement,<br>L'equipe MediSync</p>",
            appointment.getPatient().getPrenom(),
            appointment.getPatient().getNom(),
            appointment.getDate(),
            appointment.getHeureDebut()
        );
        sendEmail(appointment.getPatient().getEmail(), subject, html);
    }

    @Async
    public void sendAppointmentReminder(Appointment appointment, String timing) {
        String subject = "Rappel: Rendez-vous " + timing + " - MediSync";
        String html = String.format(
            "<h2>Bonjour %s %s,</h2>" +
            "<p>Ceci est un rappel pour votre rendez-vous:</p>" +
            "<ul>" +
            "<li><strong>Date:</strong> %s</li>" +
            "<li><strong>Heure:</strong> %s</li>" +
            "<li><strong>Medecin:</strong> Dr. %s %s</li>" +
            "</ul>" +
            "<p>Cordialement,<br>L'equipe MediSync</p>",
            appointment.getPatient().getPrenom(),
            appointment.getPatient().getNom(),
            appointment.getDate(),
            appointment.getHeureDebut(),
            appointment.getMedecin().getPrenom(),
            appointment.getMedecin().getNom()
        );
        sendEmail(appointment.getPatient().getEmail(), subject, html);
    }

    public void sendEmail(String to, String subject, String html) {
        String json = String.format(
            "{\"from\":\"%s\",\"to\":[\"%s\"],\"subject\":\"%s\",\"html\":\"%s\"}",
            fromEmail,
            to,
            subject.replace("\"", "\\\""),
            html.replace("\"", "\\\"").replace("\n", "")
        );

        RequestBody body = RequestBody.create(json, JSON);
        Request request = new Request.Builder()
            .url("https://api.resend.com/emails")
            .addHeader("Authorization", "Bearer " + apiKey)
            .addHeader("Content-Type", "application/json")
            .post(body)
            .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                log.error("Erreur envoi email Resend: " + response.code());
            } else {
                log.info("Email envoye a " + to);
            }
        } catch (IOException e) {
            log.error("Erreur envoi email: " + e.getMessage());
        }
    }
}
