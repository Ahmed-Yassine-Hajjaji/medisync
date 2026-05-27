package com.medisync.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class FirebaseService {

    @Value("${FIREBASE_SERVICE_ACCOUNT_PATH:./firebase-service-account.json}")
    private String serviceAccountPath;

    private FirebaseMessaging firebaseMessaging;

    @PostConstruct
    public void initialize() {
        try {
            FileInputStream serviceAccount = new FileInputStream(serviceAccountPath);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

            firebaseMessaging = FirebaseMessaging.getInstance();
            log.info("Firebase initialized successfully");
        } catch (IOException e) {
            log.error("Failed to initialize Firebase: {}", e.getMessage());
        }
    }

    /**
     * Send notification to a single device
     */
    public String sendNotification(String token, String title, String body) {
        return sendNotification(token, title, body, null);
    }

    /**
     * Send notification with custom data
     */
    public String sendNotification(String token, String title, String body, Map<String, String> data) {
        if (firebaseMessaging == null) {
            log.warn("Firebase not initialized, skipping notification");
            return null;
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(token)
                    .setNotification(notification)
                    .setAndroidConfig(AndroidConfig.builder()
                            .setPriority(AndroidConfig.Priority.HIGH)
                            .setNotification(AndroidNotification.builder()
                                    .setSound("default")
                                    .setChannelId("medisync_appointments")
                                    .build())
                            .build())
                    .setApnsConfig(ApnsConfig.builder()
                            .setAps(Aps.builder()
                                    .setSound("default")
                                    .setBadge(1)
                                    .build())
                            .build());

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            String response = firebaseMessaging.send(messageBuilder.build());
            log.info("FCM notification sent successfully: {}", response);
            return response;
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send FCM notification: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Send appointment reminder notification
     */
    public void sendAppointmentReminder(String fcmToken, String patientName, String doctorName,
                                         String date, String time, String reminderType) {
        String title = "Rappel de rendez-vous";
        String body;

        if ("24h".equals(reminderType)) {
            body = String.format("Votre rendez-vous avec Dr. %s est demain a %s", doctorName, time);
        } else if ("1h".equals(reminderType)) {
            body = String.format("Votre rendez-vous avec Dr. %s est dans 1 heure", doctorName);
        } else {
            body = String.format("Rappel: Rendez-vous avec Dr. %s le %s a %s", doctorName, date, time);
        }

        Map<String, String> data = new HashMap<>();
        data.put("type", "appointment_reminder");
        data.put("reminderType", reminderType);
        data.put("doctorName", doctorName);
        data.put("date", date);
        data.put("time", time);

        sendNotification(fcmToken, title, body, data);
    }

    /**
     * Send notification to multiple devices
     */
    public BatchResponse sendMulticastNotification(List<String> tokens, String title, String body) {
        if (firebaseMessaging == null || tokens == null || tokens.isEmpty()) {
            log.warn("Firebase not initialized or no tokens provided");
            return null;
        }

        try {
            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(tokens)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            BatchResponse response = firebaseMessaging.sendEachForMulticast(message);
            log.info("FCM multicast sent. Success: {}, Failure: {}",
                    response.getSuccessCount(), response.getFailureCount());
            return response;
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send multicast notification: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Subscribe device to a topic
     */
    public void subscribeToTopic(String token, String topic) {
        if (firebaseMessaging == null) return;

        try {
            firebaseMessaging.subscribeToTopic(List.of(token), topic);
            log.info("Subscribed to topic: {}", topic);
        } catch (FirebaseMessagingException e) {
            log.error("Failed to subscribe to topic: {}", e.getMessage());
        }
    }

    /**
     * Send notification to a topic
     */
    public String sendToTopic(String topic, String title, String body) {
        if (firebaseMessaging == null) return null;

        try {
            Message message = Message.builder()
                    .setTopic(topic)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            return firebaseMessaging.send(message);
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send to topic: {}", e.getMessage());
            return null;
        }
    }
}
