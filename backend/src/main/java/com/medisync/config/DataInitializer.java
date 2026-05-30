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
        seedIfEmpty();
    }

    /**
     * Initialise les donnees de demonstration uniquement si la base est vide.
     * Retourne true si les donnees ont ete creees, false si la base etait deja peuplee.
     */
    public boolean seedIfEmpty() {
        if (adminRepository.count() == 0) {
            initData();
            return true;
        }
        return false;
    }

    private void initData() {
        // Clinique principale a Casablanca
        Clinique clinique = new Clinique();
        clinique.setNom("Clinique MediSync");
        clinique.setAdresse("45 Boulevard Zerktouni, Maarif");
        clinique.setVille("Casablanca");
        clinique.setCodePostal("20100");
        clinique.setTelephone("0522-123-456");
        clinique.setEmail("contact@medisync.ma");
        clinique.setHorairesOuverture("Lun-Ven: 8h-19h, Sam: 9h-13h");
        clinique = cliniqueRepository.save(clinique);

        // Admin
        Admin admin = new Admin();
        admin.setEmail("admin@medisync.ma");
        admin.setPassword(passwordEncoder.encode("Test@2026"));
        admin.setNom("Hajjaji");
        admin.setPrenom("Ahmed");
        admin.setRole(Role.ADMIN);
        admin.setTwoFactorEnabled(false);
        admin.setClinique(clinique);
        adminRepository.save(admin);

        // Medecin Generaliste - Secteur 1 (150 DH)
        Medecin medecin1 = new Medecin();
        medecin1.setEmail("dr.benali@medisync.ma");
        medecin1.setPassword(passwordEncoder.encode("Test@2026"));
        medecin1.setNom("Benali");
        medecin1.setPrenom("Karim");
        medecin1.setRole(Role.MEDECIN);
        medecin1.setSpecialite(Specialite.GENERALISTE);
        medecin1.setNumeroOrdre("MED-MA-001");
        medecin1.setTarifConsultation(new BigDecimal("150.00"));
        medecin1.setDureeConsultation(20);
        medecin1.setLanguesParlees("Arabe, Francais, Anglais");
        medecin1.setDescription("Medecin generaliste experimente, 15 ans d'experience");
        medecin1.setClinique(clinique);
        medecin1 = medecinRepository.save(medecin1);

        // Cardiologue - Specialiste (500 DH)
        Medecin medecin2 = new Medecin();
        medecin2.setEmail("dr.elkhaldi@medisync.ma");
        medecin2.setPassword(passwordEncoder.encode("Test@2026"));
        medecin2.setNom("El Khaldi");
        medecin2.setPrenom("Fatima");
        medecin2.setRole(Role.MEDECIN);
        medecin2.setSpecialite(Specialite.CARDIOLOGUE);
        medecin2.setNumeroOrdre("MED-MA-002");
        medecin2.setTarifConsultation(new BigDecimal("500.00"));
        medecin2.setDureeConsultation(45);
        medecin2.setLanguesParlees("Arabe, Francais");
        medecin2.setDescription("Cardiologue specialisee en cardiologie interventionnelle");
        medecin2.setClinique(clinique);
        medecin2 = medecinRepository.save(medecin2);

        // Dermatologue - Specialiste (400 DH)
        Medecin medecin3 = new Medecin();
        medecin3.setEmail("dr.tazi@medisync.ma");
        medecin3.setPassword(passwordEncoder.encode("Test@2026"));
        medecin3.setNom("Tazi");
        medecin3.setPrenom("Youssef");
        medecin3.setRole(Role.MEDECIN);
        medecin3.setSpecialite(Specialite.DERMATOLOGUE);
        medecin3.setNumeroOrdre("MED-MA-003");
        medecin3.setTarifConsultation(new BigDecimal("400.00"));
        medecin3.setDureeConsultation(30);
        medecin3.setLanguesParlees("Arabe, Francais, Amazigh");
        medecin3.setDescription("Dermatologue specialise en dermatologie esthetique");
        medecin3.setClinique(clinique);
        medecin3 = medecinRepository.save(medecin3);

        // Pediatre - Specialiste (300 DH)
        Medecin medecin4 = new Medecin();
        medecin4.setEmail("dr.amrani@medisync.ma");
        medecin4.setPassword(passwordEncoder.encode("Test@2026"));
        medecin4.setNom("Amrani");
        medecin4.setPrenom("Laila");
        medecin4.setRole(Role.MEDECIN);
        medecin4.setSpecialite(Specialite.PEDIATRE);
        medecin4.setNumeroOrdre("MED-MA-004");
        medecin4.setTarifConsultation(new BigDecimal("300.00"));
        medecin4.setDureeConsultation(30);
        medecin4.setLanguesParlees("Arabe, Francais");
        medecin4.setDescription("Pediatre devouee aux soins des enfants");
        medecin4.setClinique(clinique);
        medecin4 = medecinRepository.save(medecin4);

        // Generaliste Secteur 2 (200 DH)
        Medecin medecin5 = new Medecin();
        medecin5.setEmail("dr.berrada@medisync.ma");
        medecin5.setPassword(passwordEncoder.encode("Test@2026"));
        medecin5.setNom("Berrada");
        medecin5.setPrenom("Omar");
        medecin5.setRole(Role.MEDECIN);
        medecin5.setSpecialite(Specialite.GENERALISTE);
        medecin5.setNumeroOrdre("MED-MA-005");
        medecin5.setTarifConsultation(new BigDecimal("200.00"));
        medecin5.setDureeConsultation(25);
        medecin5.setLanguesParlees("Arabe, Francais, Espagnol");
        medecin5.setDescription("Medecin de famille, secteur 2");
        medecin5.setClinique(clinique);
        medecin5 = medecinRepository.save(medecin5);

        // Chirurgien (700 DH)
        Medecin medecin6 = new Medecin();
        medecin6.setEmail("dr.fassi@medisync.ma");
        medecin6.setPassword(passwordEncoder.encode("Test@2026"));
        medecin6.setNom("Fassi Fihri");
        medecin6.setPrenom("Mohammed");
        medecin6.setRole(Role.MEDECIN);
        medecin6.setSpecialite(Specialite.CHIRURGIEN);
        medecin6.setNumeroOrdre("MED-MA-006");
        medecin6.setTarifConsultation(new BigDecimal("700.00"));
        medecin6.setDureeConsultation(60);
        medecin6.setLanguesParlees("Arabe, Francais, Anglais");
        medecin6.setDescription("Chirurgien general et digestif");
        medecin6.setClinique(clinique);
        medecin6 = medecinRepository.save(medecin6);

        // Disponibilites pour les medecins principaux
        for (DayOfWeek day : new DayOfWeek[]{DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY}) {
            // Medecin 1 - matin et apres-midi
            createDisponibilite(medecin1, day, 9, 0, 12, 30);
            createDisponibilite(medecin1, day, 14, 0, 18, 0);

            // Medecin 2 - matin seulement
            createDisponibilite(medecin2, day, 8, 30, 13, 0);

            // Medecin 3 - apres-midi seulement
            createDisponibilite(medecin3, day, 14, 30, 19, 0);
        }

        // Samedi matin pour certains medecins
        createDisponibilite(medecin1, DayOfWeek.SATURDAY, 9, 0, 13, 0);
        createDisponibilite(medecin4, DayOfWeek.SATURDAY, 9, 0, 13, 0);

        // Secretaire
        Secretaire secretaire = new Secretaire();
        secretaire.setEmail("secretaire@medisync.ma");
        secretaire.setPassword(passwordEncoder.encode("Test@2026"));
        secretaire.setNom("Alaoui");
        secretaire.setPrenom("Khadija");
        secretaire.setRole(Role.SECRETAIRE);
        secretaire.setTelephone("0661-234-567");
        secretaire.setClinique(clinique);
        secretaireRepository.save(secretaire);

        // Patient test
        Patient patient = new Patient();
        patient.setEmail("patient@test.ma");
        patient.setPassword(passwordEncoder.encode("Test@2026"));
        patient.setNom("Idrissi");
        patient.setPrenom("Amine");
        patient.setRole(Role.PATIENT);
        patient.setTelephone("0612-345-678");
        patient.setAdresse("25 Rue Hassan II, Gueliz, Marrakech");
        patientRepository.save(patient);
    }

    private void createDisponibilite(Medecin medecin, DayOfWeek day, int startHour, int startMin, int endHour, int endMin) {
        Disponibilite dispo = new Disponibilite();
        dispo.setMedecin(medecin);
        dispo.setJourSemaine(day);
        dispo.setHeureDebut(LocalTime.of(startHour, startMin));
        dispo.setHeureFin(LocalTime.of(endHour, endMin));
        dispo.setRecurrent(true);
        disponibiliteRepository.save(dispo);
    }
}
