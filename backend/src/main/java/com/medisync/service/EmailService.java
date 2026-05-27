package com.medisync.service;

import com.medisync.entity.Appointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(appointment.getPatient().getEmail());
            message.setSubject("Confirmation de votre rendez-vous - MediSync");
            message.setText(String.format(
                "Bonjour %s %s,\n\n" +
                "Votre rendez-vous a ete enregistre avec succes.\n\n" +
                "Details:\n" +
                "- Date: %s\n" +
                "- Heure: %s\n" +
                "- Medecin: Dr. %s %s\n" +
                "- Motif: %s\n\n" +
                "Cordialement,\nL'equipe MediSync",
                appointment.getPatient().getPrenom(),
                appointment.getPatient().getNom(),
                appointment.getDate(),
                appointment.getHeureDebut(),
                appointment.getMedecin().getPrenom(),
                appointment.getMedecin().getNom(),
                appointment.getMotif()
            ));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Erreur envoi email confirmation: " + e.getMessage());
        }
    }

    @Async
    public void sendAppointmentCancellation(Appointment appointment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(appointment.getPatient().getEmail());
            message.setSubject("Annulation de votre rendez-vous - MediSync");
            message.setText(String.format(
                "Bonjour %s %s,\n\n" +
                "Votre rendez-vous du %s a %s a ete annule.\n\n" +
                "N'hesitez pas a reprendre rendez-vous sur notre plateforme.\n\n" +
                "Cordialement,\nL'equipe MediSync",
                appointment.getPatient().getPrenom(),
                appointment.getPatient().getNom(),
                appointment.getDate(),
                appointment.getHeureDebut()
            ));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Erreur envoi email annulation: " + e.getMessage());
        }
    }

    @Async
    public void sendAppointmentReminder(Appointment appointment, String timing) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(appointment.getPatient().getEmail());
            message.setSubject("Rappel: Rendez-vous " + timing + " - MediSync");
            message.setText(String.format(
                "Bonjour %s %s,\n\n" +
                "Ceci est un rappel pour votre rendez-vous:\n\n" +
                "- Date: %s\n" +
                "- Heure: %s\n" +
                "- Medecin: Dr. %s %s\n\n" +
                "Cordialement,\nL'equipe MediSync",
                appointment.getPatient().getPrenom(),
                appointment.getPatient().getNom(),
                appointment.getDate(),
                appointment.getHeureDebut(),
                appointment.getMedecin().getPrenom(),
                appointment.getMedecin().getNom()
            ));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Erreur envoi email rappel: " + e.getMessage());
        }
    }
}
