package com.medisync.service;

import com.medisync.dto.*;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final SecretaireRepository secretaireRepository;
    private final AdminRepository adminRepository;
    private final CliniqueRepository cliniqueRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final ConsultationRepository consultationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate startOfYear = today.withDayOfYear(1);

        stats.setTotalPatients(patientRepository.count());
        stats.setTotalMedecins(medecinRepository.count());

        List<Appointment> todayAppointments = appointmentRepository
                .findByMedecinIdAndDateBetween(null, today, today);
        stats.setTotalAppointmentsToday((long) todayAppointments.size());

        BigDecimal revenueMonth = invoiceRepository.getTotalPaidBetween(startOfMonth, today);
        stats.setRevenueMonth(revenueMonth != null ? revenueMonth : BigDecimal.ZERO);

        BigDecimal revenueYear = invoiceRepository.getTotalPaidBetween(startOfYear, today);
        stats.setRevenueYear(revenueYear != null ? revenueYear : BigDecimal.ZERO);

        return stats;
    }

    @Transactional
    public MedecinDTO createMedecin(MedecinDTO dto, String password) {
        Medecin medecin = new Medecin();
        medecin.setEmail(dto.getEmail());
        medecin.setPassword(passwordEncoder.encode(password));
        medecin.setNom(dto.getNom());
        medecin.setPrenom(dto.getPrenom());
        medecin.setTelephone(dto.getTelephone());
        medecin.setRole(Role.MEDECIN);
        medecin.setSpecialite(dto.getSpecialite());
        medecin.setNumeroOrdre(dto.getNumeroOrdre());
        medecin.setDescription(dto.getDescription());
        medecin.setLanguesParlees(dto.getLanguesParlees());
        medecin.setTarifConsultation(dto.getTarifConsultation());
        medecin.setDureeConsultation(dto.getDureeConsultation());

        if (dto.getCliniqueId() != null) {
            Clinique clinique = cliniqueRepository.findById(dto.getCliniqueId())
                    .orElseThrow(() -> new RuntimeException("Clinique non trouvee"));
            medecin.setClinique(clinique);
        }

        medecin = medecinRepository.save(medecin);
        return toMedecinDTO(medecin);
    }

    @Transactional
    public UserDTO createSecretaire(UserDTO dto, String password, Long cliniqueId) {
        Secretaire secretaire = new Secretaire();
        secretaire.setEmail(dto.getEmail());
        secretaire.setPassword(passwordEncoder.encode(password));
        secretaire.setNom(dto.getNom());
        secretaire.setPrenom(dto.getPrenom());
        secretaire.setTelephone(dto.getTelephone());
        secretaire.setRole(Role.SECRETAIRE);

        if (cliniqueId != null) {
            Clinique clinique = cliniqueRepository.findById(cliniqueId)
                    .orElseThrow(() -> new RuntimeException("Clinique non trouvee"));
            secretaire.setClinique(clinique);
        }

        secretaire = secretaireRepository.save(secretaire);
        return toUserDTO(secretaire);
    }

    @Transactional
    public CliniqueDTO createClinique(CliniqueDTO dto) {
        Clinique clinique = new Clinique();
        clinique.setNom(dto.getNom());
        clinique.setAdresse(dto.getAdresse());
        clinique.setVille(dto.getVille());
        clinique.setCodePostal(dto.getCodePostal());
        clinique.setTelephone(dto.getTelephone());
        clinique.setEmail(dto.getEmail());
        clinique.setDescription(dto.getDescription());
        clinique.setHorairesOuverture(dto.getHorairesOuverture());
        clinique.setSpecialitesProposees(dto.getSpecialitesProposees());

        clinique = cliniqueRepository.save(clinique);
        return toCliniqueDTO(clinique);
    }

    @Transactional
    public CliniqueDTO updateClinique(Long id, CliniqueDTO dto) {
        Clinique clinique = cliniqueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clinique non trouvee"));

        clinique.setNom(dto.getNom());
        clinique.setAdresse(dto.getAdresse());
        clinique.setVille(dto.getVille());
        clinique.setCodePostal(dto.getCodePostal());
        clinique.setTelephone(dto.getTelephone());
        clinique.setEmail(dto.getEmail());
        clinique.setDescription(dto.getDescription());
        clinique.setHorairesOuverture(dto.getHorairesOuverture());
        clinique.setSpecialitesProposees(dto.getSpecialitesProposees());

        clinique = cliniqueRepository.save(clinique);
        return toCliniqueDTO(clinique);
    }

    public List<CliniqueDTO> getAllCliniques() {
        return cliniqueRepository.findAll().stream()
                .map(this::toCliniqueDTO)
                .toList();
    }

    @Transactional
    public void toggleUserStatus(Long userId, boolean enabled) {
        User user = patientRepository.findById(userId)
                .map(p -> (User) p)
                .or(() -> medecinRepository.findById(userId).map(m -> (User) m))
                .or(() -> secretaireRepository.findById(userId).map(s -> (User) s))
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        user.setEnabled(enabled);
    }

    public List<AuditLogDTO> getAuditLogs(String action, LocalDate from, LocalDate to) {
        List<AuditLog> logs;
        boolean hasAction = action != null && !action.isBlank();
        boolean hasRange = from != null && to != null;

        if (hasAction && hasRange) {
            logs = auditLogRepository.findByActionAndTimestampBetweenOrderByTimestampDesc(
                    action, from.atStartOfDay(), to.atTime(LocalTime.MAX));
        } else if (hasAction) {
            logs = auditLogRepository.findByActionOrderByTimestampDesc(action);
        } else if (hasRange) {
            logs = auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(
                    from.atStartOfDay(), to.atTime(LocalTime.MAX));
        } else {
            logs = auditLogRepository.findAllByOrderByTimestampDesc();
        }

        return logs.stream().map(this::toAuditLogDTO).toList();
    }

    private AuditLogDTO toAuditLogDTO(AuditLog log) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(log.getId());
        if (log.getUser() != null) {
            dto.setUtilisateur(log.getUser().getPrenom() + " " + log.getUser().getNom());
        } else {
            dto.setUtilisateur("Système");
        }
        dto.setAction(log.getAction());
        dto.setEntite(log.getEntite());
        dto.setEntiteId(log.getEntiteId());
        dto.setDetails(log.getDetails());
        dto.setAdresseIp(log.getAdresseIp());
        dto.setTimestamp(log.getTimestamp());
        return dto;
    }

    private MedecinDTO toMedecinDTO(Medecin m) {
        MedecinDTO dto = new MedecinDTO();
        dto.setId(m.getId());
        dto.setEmail(m.getEmail());
        dto.setNom(m.getNom());
        dto.setPrenom(m.getPrenom());
        dto.setTelephone(m.getTelephone());
        dto.setRole(m.getRole());
        dto.setSpecialite(m.getSpecialite());
        dto.setNumeroOrdre(m.getNumeroOrdre());
        dto.setTarifConsultation(m.getTarifConsultation());
        dto.setDureeConsultation(m.getDureeConsultation());
        return dto;
    }

    private UserDTO toUserDTO(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setNom(u.getNom());
        dto.setPrenom(u.getPrenom());
        dto.setTelephone(u.getTelephone());
        dto.setRole(u.getRole());
        dto.setEnabled(u.isEnabled());
        return dto;
    }

    private CliniqueDTO toCliniqueDTO(Clinique c) {
        CliniqueDTO dto = new CliniqueDTO();
        dto.setId(c.getId());
        dto.setNom(c.getNom());
        dto.setAdresse(c.getAdresse());
        dto.setVille(c.getVille());
        dto.setCodePostal(c.getCodePostal());
        dto.setTelephone(c.getTelephone());
        dto.setEmail(c.getEmail());
        dto.setDescription(c.getDescription());
        dto.setHorairesOuverture(c.getHorairesOuverture());
        dto.setSpecialitesProposees(c.getSpecialitesProposees());
        dto.setNombreMedecins(c.getMedecins().size());
        return dto;
    }
}
