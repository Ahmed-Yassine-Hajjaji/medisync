package com.medisync.config;

import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final MedecinRepository medecinRepository;
    private final PatientRepository patientRepository;
    private final SecretaireRepository secretaireRepository;
    private final CliniqueRepository cliniqueRepository;
    private final DisponibiliteRepository disponibiliteRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (adminRepository.count() == 0) {
            initData();
        }
    }

    private void initData() {
        Clinique clinique = new Clinique();
        clinique.setNom("Clinique MediSync");
        clinique.setAdresse("123 Avenue de la Sante");
        clinique.setVille("Paris");
        clinique.setCodePostal("75001");
        clinique.setTelephone("0123456789");
        clinique.setEmail("contact@medisync.fr");
        clinique.setHorairesOuverture("Lun-Ven: 8h-19h, Sam: 9h-13h");
        clinique = cliniqueRepository.save(clinique);

        Admin admin = new Admin();
        admin.setEmail("admin@medisync.fr");
        admin.setPassword(passwordEncoder.encode("Admin123!"));
        admin.setNom("Admin");
        admin.setPrenom("Super");
        admin.setRole(Role.ADMIN);
        admin.setTwoFactorEnabled(false);
        admin.setClinique(clinique);
        adminRepository.save(admin);

        Medecin medecin1 = new Medecin();
        medecin1.setEmail("dr.martin@medisync.fr");
        medecin1.setPassword(passwordEncoder.encode("Doctor123!"));
        medecin1.setNom("Martin");
        medecin1.setPrenom("Jean");
        medecin1.setRole(Role.MEDECIN);
        medecin1.setSpecialite(Specialite.GENERALISTE);
        medecin1.setNumeroOrdre("MED001");
        medecin1.setTarifConsultation(new BigDecimal("25.00"));
        medecin1.setDureeConsultation(30);
        medecin1.setLanguesParlees("Francais, Anglais");
        medecin1.setClinique(clinique);
        medecin1 = medecinRepository.save(medecin1);

        Medecin medecin2 = new Medecin();
        medecin2.setEmail("dr.dupont@medisync.fr");
        medecin2.setPassword(passwordEncoder.encode("Doctor123!"));
        medecin2.setNom("Dupont");
        medecin2.setPrenom("Marie");
        medecin2.setRole(Role.MEDECIN);
        medecin2.setSpecialite(Specialite.CARDIOLOGUE);
        medecin2.setNumeroOrdre("MED002");
        medecin2.setTarifConsultation(new BigDecimal("50.00"));
        medecin2.setDureeConsultation(45);
        medecin2.setLanguesParlees("Francais");
        medecin2.setClinique(clinique);
        medecin2 = medecinRepository.save(medecin2);

        for (DayOfWeek day : new DayOfWeek[]{DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY}) {
            Disponibilite dispo1 = new Disponibilite();
            dispo1.setMedecin(medecin1);
            dispo1.setJourSemaine(day);
            dispo1.setHeureDebut(LocalTime.of(9, 0));
            dispo1.setHeureFin(LocalTime.of(12, 0));
            dispo1.setRecurrent(true);
            disponibiliteRepository.save(dispo1);

            Disponibilite dispo2 = new Disponibilite();
            dispo2.setMedecin(medecin1);
            dispo2.setJourSemaine(day);
            dispo2.setHeureDebut(LocalTime.of(14, 0));
            dispo2.setHeureFin(LocalTime.of(18, 0));
            dispo2.setRecurrent(true);
            disponibiliteRepository.save(dispo2);
        }

        Secretaire secretaire = new Secretaire();
        secretaire.setEmail("secretaire@medisync.fr");
        secretaire.setPassword(passwordEncoder.encode("Secret123!"));
        secretaire.setNom("Bernard");
        secretaire.setPrenom("Sophie");
        secretaire.setRole(Role.SECRETAIRE);
        secretaire.setClinique(clinique);
        secretaireRepository.save(secretaire);

        Patient patient = new Patient();
        patient.setEmail("patient@test.fr");
        patient.setPassword(passwordEncoder.encode("Patient123!"));
        patient.setNom("Durand");
        patient.setPrenom("Pierre");
        patient.setRole(Role.PATIENT);
        patient.setTelephone("0612345678");
        patient.setAdresse("10 Rue des Patients, 75002 Paris");
        patientRepository.save(patient);
    }
}
