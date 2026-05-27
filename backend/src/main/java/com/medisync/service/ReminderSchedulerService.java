package com.medisync.service;

import com.medisync.entity.Appointment;
import com.medisync.entity.User;
import com.medisync.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderSchedulerService {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final FirebaseService firebaseService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Check for appointments 24 hours from now and send reminders
     * Runs every hour at minute 0
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional(readOnly = true)
    public void sendReminders24hBefore() {
        log.info("Running 24h reminder scheduler...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime targetStart = now.plusHours(24).withMinute(0).withSecond(0);
        LocalDateTime targetEnd = targetStart.plusHours(1);

        List<Appointment> appointments = appointmentRepository
                .findAppointmentsForReminder(targetStart, targetEnd, "CONFIRME");

        log.info("Found {} appointments for 24h reminder", appointments.size());

        for (Appointment appointment : appointments) {
            try {
                sendReminderNotifications(appointment, "24h");
            } catch (Exception e) {
                log.error("Failed to send 24h reminder for appointment {}: {}",
                        appointment.getId(), e.getMessage());
            }
        }
    }

    /**
     * Check for appointments 1 hour from now and send reminders
     * Runs every 15 minutes
     */
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional(readOnly = true)
    public void sendReminders1hBefore() {
        log.info("Running 1h reminder scheduler...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime targetStart = now.plusHours(1).withSecond(0);
        LocalDateTime targetEnd = targetStart.plusMinutes(15);

        List<Appointment> appointments = appointmentRepository
                .findAppointmentsForReminder(targetStart, targetEnd, "CONFIRME");

        log.info("Found {} appointments for 1h reminder", appointments.size());

        for (Appointment appointment : appointments) {
            try {
                sendReminderNotifications(appointment, "1h");
            } catch (Exception e) {
                log.error("Failed to send 1h reminder for appointment {}: {}",
                        appointment.getId(), e.getMessage());
            }
        }
    }

    /**
     * Send morning reminders for all appointments of the day
     * Runs at 7:00 AM every day
     */
    @Scheduled(cron = "0 0 7 * * *")
    @Transactional(readOnly = true)
    public void sendMorningReminders() {
        log.info("Running morning reminder scheduler...");

        LocalDate today = LocalDate.now();
        List<Appointment> appointments = appointmentRepository
                .findByDateAndStatut(today, "CONFIRME");

        log.info("Found {} appointments for today's morning reminder", appointments.size());

        for (Appointment appointment : appointments) {
            try {
                sendReminderNotifications(appointment, "morning");
            } catch (Exception e) {
                log.error("Failed to send morning reminder for appointment {}: {}",
                        appointment.getId(), e.getMessage());
            }
        }
    }

    private void sendReminderNotifications(Appointment appointment, String reminderType) {
        User patient = appointment.getPatient();
        User medecin = appointment.getMedecin();

        String patientName = patient.getPrenom() + " " + patient.getNom();
        String doctorName = medecin.getPrenom() + " " + medecin.getNom();
        String date = appointment.getDate().format(DATE_FORMATTER);
        String time = appointment.getHeureDebut().format(TIME_FORMATTER);

        // Send email via Resend
        sendEmailReminder(patient, doctorName, date, time, reminderType);

        // Send push notification via FCM if patient has FCM token
        if (patient.getFcmToken() != null && !patient.getFcmToken().isEmpty()) {
            firebaseService.sendAppointmentReminder(
                    patient.getFcmToken(),
                    patientName,
                    doctorName,
                    date,
                    time,
                    reminderType
            );
        }

        log.info("Sent {} reminder for appointment {} to patient {}",
                reminderType, appointment.getId(), patient.getEmail());
    }

    private void sendEmailReminder(User patient, String doctorName, String date, String time, String reminderType) {
        String subject;
        String content;

        switch (reminderType) {
            case "24h":
                subject = "Rappel: Votre rendez-vous demain";
                content = buildReminderEmailContent(patient.getPrenom(), doctorName, date, time,
                        "Nous vous rappelons que vous avez un rendez-vous <strong>demain</strong>.");
                break;
            case "1h":
                subject = "Rappel: Votre rendez-vous dans 1 heure";
                content = buildReminderEmailContent(patient.getPrenom(), doctorName, date, time,
                        "Votre rendez-vous est <strong>dans 1 heure</strong>. N'oubliez pas de vous presenter a l'accueil.");
                break;
            case "morning":
                subject = "Rappel: Votre rendez-vous aujourd'hui";
                content = buildReminderEmailContent(patient.getPrenom(), doctorName, date, time,
                        "Nous vous rappelons que vous avez un rendez-vous <strong>aujourd'hui</strong>.");
                break;
            default:
                subject = "Rappel de rendez-vous MediSync";
                content = buildReminderEmailContent(patient.getPrenom(), doctorName, date, time,
                        "Rappel de votre prochain rendez-vous.");
        }

        emailService.sendEmail(patient.getEmail(), subject, content);
    }

    private String buildReminderEmailContent(String patientName, String doctorName,
                                              String date, String time, String message) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px; }
                    .appointment-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2; }
                    .detail { margin: 10px 0; }
                    .label { color: #666; font-size: 12px; text-transform: uppercase; }
                    .value { font-size: 16px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>MediSync</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour %s,</p>
                        <p>%s</p>

                        <div class="appointment-box">
                            <div class="detail">
                                <span class="label">Medecin</span><br>
                                <span class="value">Dr. %s</span>
                            </div>
                            <div class="detail">
                                <span class="label">Date</span><br>
                                <span class="value">%s</span>
                            </div>
                            <div class="detail">
                                <span class="label">Heure</span><br>
                                <span class="value">%s</span>
                            </div>
                        </div>

                        <p>Si vous devez annuler ou reporter ce rendez-vous, veuillez nous contacter au plus vite.</p>

                        <div class="footer">
                            <p>Clinique MediSync<br>
                            Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, patientName, message, doctorName, date, time);
    }
}
