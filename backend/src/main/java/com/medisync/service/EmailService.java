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

    /**
     * Envoie un email au patient lors de la création d'un RDV.
     * Extrait toutes les données AVANT l'appel async pour éviter le LazyInitializationException.
     */
    public void sendAppointmentConfirmation(Appointment appointment) {
        String patientEmail = appointment.getPatient().getEmail();
        String patientPrenom = appointment.getPatient().getPrenom();
        String patientNom = appointment.getPatient().getNom();
        String medecinPrenom = appointment.getMedecin().getPrenom();
        String medecinNom = appointment.getMedecin().getNom();
        String date = String.valueOf(appointment.getDate());
        String heure = String.valueOf(appointment.getHeureDebut());
        String motif = String.valueOf(appointment.getMotif());

        sendAppointmentConfirmationAsync(patientEmail, patientPrenom, patientNom,
                medecinPrenom, medecinNom, date, heure, motif);
    }

    @Async
    public void sendAppointmentConfirmationAsync(String patientEmail, String patientPrenom,
            String patientNom, String medecinPrenom, String medecinNom,
            String date, String heure, String motif) {
        String subject = "Votre rendez-vous a ete enregistre - MediSync";
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
            "<p>Vous recevrez un email de confirmation lorsque votre medecin aura valide le rendez-vous.</p>" +
            "<p>Cordialement,<br>L'equipe MediSync</p>",
            patientPrenom, patientNom, date, heure, medecinPrenom, medecinNom, motif
        );
        sendEmail(patientEmail, subject, html);
    }

    /**
     * Email de changement de statut (confirmation, etc.)
     */
    public void sendAppointmentStatusUpdate(Appointment appointment, String newStatus) {
        String patientEmail = appointment.getPatient().getEmail();
        String patientPrenom = appointment.getPatient().getPrenom();
        String patientNom = appointment.getPatient().getNom();
        String medecinPrenom = appointment.getMedecin().getPrenom();
        String medecinNom = appointment.getMedecin().getNom();
        String date = String.valueOf(appointment.getDate());
        String heure = String.valueOf(appointment.getHeureDebut());
        String motif = String.valueOf(appointment.getMotif());

        sendAppointmentStatusUpdateAsync(patientEmail, patientPrenom, patientNom,
                medecinPrenom, medecinNom, date, heure, motif, newStatus);
    }

    @Async
    public void sendAppointmentStatusUpdateAsync(String patientEmail, String patientPrenom,
            String patientNom, String medecinPrenom, String medecinNom,
            String date, String heure, String motif, String newStatus) {
        String subject = "Votre rendez-vous a ete " + newStatus + " - MediSync";
        String html = String.format(
            "<h2>Bonjour %s %s,</h2>" +
            "<p>Votre rendez-vous a ete <strong>%s</strong>.</p>" +
            "<h3>Details:</h3>" +
            "<ul>" +
            "<li><strong>Date:</strong> %s</li>" +
            "<li><strong>Heure:</strong> %s</li>" +
            "<li><strong>Medecin:</strong> Dr. %s %s</li>" +
            "<li><strong>Motif:</strong> %s</li>" +
            "</ul>" +
            "<p>Cordialement,<br>L'equipe MediSync</p>",
            patientPrenom, patientNom, newStatus, date, heure, medecinPrenom, medecinNom, motif
        );
        sendEmail(patientEmail, subject, html);
    }

    /**
     * Email d'annulation
     */
    public void sendAppointmentCancellation(Appointment appointment) {
        String patientEmail = appointment.getPatient().getEmail();
        String patientPrenom = appointment.getPatient().getPrenom();
        String patientNom = appointment.getPatient().getNom();
        String date = String.valueOf(appointment.getDate());
        String heure = String.valueOf(appointment.getHeureDebut());

        sendAppointmentCancellationAsync(patientEmail, patientPrenom, patientNom, date, heure);
    }

    @Async
    public void sendAppointmentCancellationAsync(String patientEmail, String patientPrenom,
            String patientNom, String date, String heure) {
        String subject = "Annulation de votre rendez-vous - MediSync";
        String html = String.format(
            "<h2>Bonjour %s %s,</h2>" +
            "<p>Votre rendez-vous du <strong>%s</strong> a <strong>%s</strong> a ete annule.</p>" +
            "<p>N'hesitez pas a reprendre rendez-vous sur notre plateforme.</p>" +
            "<p>Cordialement,<br>L'equipe MediSync</p>",
            patientPrenom, patientNom, date, heure
        );
        sendEmail(patientEmail, subject, html);
    }

    /**
     * Email de rappel
     */
    public void sendAppointmentReminder(Appointment appointment, String timing) {
        String patientEmail = appointment.getPatient().getEmail();
        String patientPrenom = appointment.getPatient().getPrenom();
        String patientNom = appointment.getPatient().getNom();
        String medecinPrenom = appointment.getMedecin().getPrenom();
        String medecinNom = appointment.getMedecin().getNom();
        String date = String.valueOf(appointment.getDate());
        String heure = String.valueOf(appointment.getHeureDebut());

        sendAppointmentReminderAsync(patientEmail, patientPrenom, patientNom,
                medecinPrenom, medecinNom, date, heure, timing);
    }

    @Async
    public void sendAppointmentReminderAsync(String patientEmail, String patientPrenom,
            String patientNom, String medecinPrenom, String medecinNom,
            String date, String heure, String timing) {
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
            patientPrenom, patientNom, date, heure, medecinPrenom, medecinNom
        );
        sendEmail(patientEmail, subject, html);
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
                String respBody = response.body() != null ? response.body().string() : "";
                log.error("Erreur envoi email Resend ({}): {}", response.code(), respBody);
            } else {
                log.info("Email envoye a {}", to);
            }
        } catch (IOException e) {
            log.error("Erreur envoi email: {}", e.getMessage());
        }
    }
}
