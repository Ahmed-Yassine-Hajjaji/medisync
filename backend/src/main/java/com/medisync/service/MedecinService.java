package com.medisync.service;

import com.medisync.dto.MedecinDTO;
import com.medisync.dto.DisponibiliteDTO;
import com.medisync.dto.CreneauDTO;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedecinService {

    private final MedecinRepository medecinRepository;
    private final DisponibiliteRepository disponibiliteRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;

    public List<MedecinDTO> getAllMedecins() {
        return medecinRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MedecinDTO getMedecinById(Long id) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medecin non trouve"));
        return toDTO(medecin);
    }

    public List<MedecinDTO> getMedecinsBySpecialite(Specialite specialite) {
        return medecinRepository.findBySpecialite(specialite).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MedecinDTO> getMedecinsByLangue(String langue) {
        String needle = langue.toLowerCase();
        return medecinRepository.findAll().stream()
                .filter(m -> m.getLanguesParlees() != null
                        && m.getLanguesParlees().toLowerCase().contains(needle))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MedecinDTO> searchMedecins(String search) {
        return medecinRepository.searchByNomOrPrenom(search).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MedecinDTO> getMedecinsBySpecialiteAndVille(Specialite specialite, String ville) {
        return medecinRepository.findBySpecialiteAndVille(specialite, ville).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedecinDTO updateMedecin(Long id, MedecinDTO dto) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medecin non trouve"));

        medecin.setNom(dto.getNom());
        medecin.setPrenom(dto.getPrenom());
        medecin.setTelephone(dto.getTelephone());
        medecin.setDescription(dto.getDescription());
        medecin.setLanguesParlees(dto.getLanguesParlees());
        medecin.setTarifConsultation(dto.getTarifConsultation());
        medecin.setDureeConsultation(dto.getDureeConsultation());
        medecin.setHoraires(dto.getHoraires());

        medecin = medecinRepository.save(medecin);
        return toDTO(medecin);
    }

    public List<DisponibiliteDTO> getDisponibilites(Long medecinId) {
        return disponibiliteRepository.findByMedecinId(medecinId).stream()
                .map(this::toDisponibiliteDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DisponibiliteDTO addDisponibilite(Long medecinId, DisponibiliteDTO dto) {
        Medecin medecin = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new RuntimeException("Medecin non trouve"));

        Disponibilite dispo = new Disponibilite();
        dispo.setMedecin(medecin);
        dispo.setJourSemaine(dto.getJourSemaine());
        dispo.setDateSpecifique(dto.getDateSpecifique());
        dispo.setHeureDebut(dto.getHeureDebut());
        dispo.setHeureFin(dto.getHeureFin());
        dispo.setEstConge(dto.isEstConge());
        dispo.setRecurrent(dto.isRecurrent());

        dispo = disponibiliteRepository.save(dispo);
        return toDisponibiliteDTO(dispo);
    }

    public void deleteDisponibilite(Long medecinId, Long dispoId) {
        Disponibilite dispo = disponibiliteRepository.findById(dispoId)
                .orElseThrow(() -> new RuntimeException("Disponibilite non trouvee"));
        if (!dispo.getMedecin().getId().equals(medecinId)) {
            throw new RuntimeException("Non autorise");
        }
        disponibiliteRepository.delete(dispo);
    }

    public List<CreneauDTO> getCreneauxDisponibles(Long medecinId, LocalDate date) {
        Medecin medecin = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new RuntimeException("Medecin non trouve"));

        List<Disponibilite> disponibilites = disponibiliteRepository
                .findByMedecinIdAndJourSemaine(medecinId, date.getDayOfWeek());

        List<Appointment> appointments = appointmentRepository
                .findByMedecinIdAndDate(medecinId, date);

        List<CreneauDTO> creneaux = new ArrayList<>();
        int duree = medecin.getDureeConsultation();

        for (Disponibilite dispo : disponibilites) {
            if (dispo.isEstConge()) continue;

            LocalTime current = dispo.getHeureDebut();
            while (current.plusMinutes(duree).isBefore(dispo.getHeureFin()) ||
                   current.plusMinutes(duree).equals(dispo.getHeureFin())) {

                LocalTime slotEnd = current.plusMinutes(duree);
                boolean isAvailable = true;

                for (Appointment apt : appointments) {
                    if (apt.getStatut() != StatutAppointment.ANNULE &&
                        !current.isBefore(apt.getHeureDebut()) &&
                        current.isBefore(apt.getHeureFin())) {
                        isAvailable = false;
                        break;
                    }
                }

                creneaux.add(new CreneauDTO(date, current, slotEnd, isAvailable));
                current = slotEnd;
            }
        }

        return creneaux;
    }

    public void updateNoteMoyenne(Long medecinId) {
        Double moyenne = reviewRepository.getAverageNoteByMedecinId(medecinId);
        Long count = reviewRepository.countByMedecinId(medecinId);

        Medecin medecin = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new RuntimeException("Medecin non trouve"));

        medecin.setNotemoyenne(moyenne != null ? moyenne : 0.0);
        medecin.setNombreAvis(count != null ? count.intValue() : 0);
        medecinRepository.save(medecin);
    }

    private MedecinDTO toDTO(Medecin medecin) {
        MedecinDTO dto = new MedecinDTO();
        dto.setId(medecin.getId());
        dto.setEmail(medecin.getEmail());
        dto.setNom(medecin.getNom());
        dto.setPrenom(medecin.getPrenom());
        dto.setTelephone(medecin.getTelephone());
        dto.setRole(medecin.getRole());
        dto.setEnabled(medecin.isEnabled());
        dto.setSpecialite(medecin.getSpecialite());
        dto.setNumeroOrdre(medecin.getNumeroOrdre());
        dto.setDescription(medecin.getDescription());
        dto.setLanguesParlees(medecin.getLanguesParlees());
        dto.setTarifConsultation(medecin.getTarifConsultation());
        dto.setDureeConsultation(medecin.getDureeConsultation());
        dto.setHoraires(medecin.getHoraires());
        dto.setNoteMoyenne(medecin.getNotemoyenne());
        dto.setNombreAvis(medecin.getNombreAvis());
        if (medecin.getClinique() != null) {
            dto.setCliniqueId(medecin.getClinique().getId());
            dto.setCliniqueNom(medecin.getClinique().getNom());
        }
        return dto;
    }

    private DisponibiliteDTO toDisponibiliteDTO(Disponibilite dispo) {
        DisponibiliteDTO dto = new DisponibiliteDTO();
        dto.setId(dispo.getId());
        dto.setMedecinId(dispo.getMedecin().getId());
        dto.setJourSemaine(dispo.getJourSemaine());
        dto.setDateSpecifique(dispo.getDateSpecifique());
        dto.setHeureDebut(dispo.getHeureDebut());
        dto.setHeureFin(dispo.getHeureFin());
        dto.setEstConge(dispo.isEstConge());
        dto.setRecurrent(dispo.isRecurrent());
        return dto;
    }
}
