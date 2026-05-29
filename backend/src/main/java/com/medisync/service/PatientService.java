package com.medisync.service;

import com.medisync.dto.PatientDTO;
import com.medisync.entity.Patient;
import com.medisync.entity.Role;
import com.medisync.repository.PatientRepository;
import com.medisync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient non trouve"));
        return toDTO(patient);
    }

    public PatientDTO getPatientByEmail(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient non trouve"));
        return toDTO(patient);
    }

    public List<PatientDTO> searchPatients(String search) {
        return patientRepository.searchByNomOrPrenom(search).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientDTO updatePatient(Long id, PatientDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient non trouve"));

        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setTelephone(dto.getTelephone());
        patient.setDateNaissance(dto.getDateNaissance());
        patient.setAdresse(dto.getAdresse());
        patient.setGroupeSanguin(dto.getGroupeSanguin());
        patient.setAllergies(dto.getAllergies());
        patient.setAntecedents(dto.getAntecedents());

        patient = patientRepository.save(patient);
        return toDTO(patient);
    }

    @Transactional
    public PatientDTO createPatient(PatientDTO dto, String password) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Cet email est deja utilise");
        }
        Patient patient = new Patient();
        patient.setEmail(dto.getEmail());
        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setTelephone(dto.getTelephone());
        patient.setDateNaissance(dto.getDateNaissance());
        patient.setAdresse(dto.getAdresse());
        patient.setGroupeSanguin(dto.getGroupeSanguin());
        patient.setAllergies(dto.getAllergies());
        patient.setAntecedents(dto.getAntecedents());
        patient.setRole(Role.PATIENT);
        patient.setPassword(passwordEncoder.encode(password != null && !password.isBlank() ? password : "Changeme@2026"));
        patient.setEnabled(true);

        patient = patientRepository.save(patient);
        return toDTO(patient);
    }

    @Transactional
    public PatientDTO createDependant(Long parentId, PatientDTO dto) {
        Patient parent = patientRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Patient parent non trouve"));

        Patient dependant = new Patient();
        dependant.setEmail(dto.getEmail());
        dependant.setNom(dto.getNom());
        dependant.setPrenom(dto.getPrenom());
        dependant.setDateNaissance(dto.getDateNaissance());
        dependant.setParent(parent);
        dependant.setRole(parent.getRole());
        dependant.setPassword(parent.getPassword());

        dependant = patientRepository.save(dependant);
        return toDTO(dependant);
    }

    public List<PatientDTO> getDependants(Long parentId) {
        return patientRepository.findByParentId(parentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private PatientDTO toDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setEmail(patient.getEmail());
        dto.setNom(patient.getNom());
        dto.setPrenom(patient.getPrenom());
        dto.setTelephone(patient.getTelephone());
        dto.setRole(patient.getRole());
        dto.setEnabled(patient.isEnabled());
        dto.setDateNaissance(patient.getDateNaissance());
        dto.setAdresse(patient.getAdresse());
        dto.setNumeroSecuriteSociale(patient.getNumeroSecuriteSociale());
        dto.setGroupeSanguin(patient.getGroupeSanguin());
        dto.setAllergies(patient.getAllergies());
        dto.setAntecedents(patient.getAntecedents());
        if (patient.getParent() != null) {
            dto.setParentId(patient.getParent().getId());
        }
        return dto;
    }
}
