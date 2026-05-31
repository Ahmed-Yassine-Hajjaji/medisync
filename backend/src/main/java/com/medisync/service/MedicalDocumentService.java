package com.medisync.service;

import com.medisync.dto.MedicalDocumentDTO;
import com.medisync.entity.MedicalDocument;
import com.medisync.entity.Patient;
import com.medisync.entity.TypeDocument;
import com.medisync.entity.User;
import com.medisync.repository.MedicalDocumentRepository;
import com.medisync.repository.PatientRepository;
import com.medisync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalDocumentService {

    private final MedicalDocumentRepository medicalDocumentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public List<MedicalDocumentDTO> getDocumentsByPatient(Long patientId) {
        return medicalDocumentRepository.findByPatientId(patientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MedicalDocumentDTO> getDocumentsByPatientAndType(Long patientId, TypeDocument type) {
        return medicalDocumentRepository.findByPatientIdAndType(patientId, type).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MedicalDocumentDTO uploadDocument(Long patientId, Long uploadedById, MultipartFile file, String category) throws IOException {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouve"));
        User uploader = userRepository.findById(uploadedById)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        String fileUrl = storageService.uploadFile(file, patientId, category != null ? category : "documents");

        TypeDocument typeDoc = TypeDocument.AUTRE;
        if (category != null) {
            try {
                typeDoc = TypeDocument.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        MedicalDocument doc = new MedicalDocument();
        doc.setPatient(patient);
        doc.setUploadedBy(uploader);
        doc.setNom(file.getOriginalFilename());
        doc.setType(typeDoc);
        doc.setCheminFichier(fileUrl);
        doc.setTypeMime(file.getContentType());
        doc.setTailleFichier(file.getSize());
        doc.setDescription(category);

        doc = medicalDocumentRepository.save(doc);
        log.info("Document uploaded for patient {}: {}", patientId, file.getOriginalFilename());
        return toDTO(doc);
    }

    public byte[] downloadDocument(Long documentId) throws IOException {
        MedicalDocument doc = medicalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouve"));

        String path = extractPathFromUrl(doc.getCheminFichier());
        return storageService.downloadFile(path);
    }

    public String getDocumentMimeType(Long documentId) {
        MedicalDocument doc = medicalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouve"));
        return doc.getTypeMime();
    }

    public String getDocumentName(Long documentId) {
        MedicalDocument doc = medicalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouve"));
        return doc.getNom();
    }

    public void deleteDocument(Long documentId, Long patientId) {
        MedicalDocument doc = medicalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouve"));

        if (!doc.getPatient().getId().equals(patientId)) {
            throw new RuntimeException("Acces non autorise");
        }

        String path = extractPathFromUrl(doc.getCheminFichier());
        storageService.deleteFile(path);
        medicalDocumentRepository.delete(doc);
        log.info("Document deleted: {}", documentId);
    }

    private String extractPathFromUrl(String url) {
        if (url == null) return "";
        int idx = url.indexOf("/storage/v1/object/public/medical-documents/");
        if (idx >= 0) {
            return url.substring(idx + "/storage/v1/object/public/medical-documents/".length());
        }
        return url;
    }

    private MedicalDocumentDTO toDTO(MedicalDocument doc) {
        MedicalDocumentDTO dto = new MedicalDocumentDTO();
        dto.setId(doc.getId());
        dto.setNom(doc.getNom());
        dto.setFilename(doc.getNom());
        dto.setOriginalName(doc.getNom());
        dto.setType(doc.getType() != null ? doc.getType().name() : "AUTRE");
        dto.setCheminFichier(doc.getCheminFichier());
        dto.setTypeMime(doc.getTypeMime());
        dto.setMimeType(doc.getTypeMime());
        dto.setTailleFichier(doc.getTailleFichier());
        dto.setSize(doc.getTailleFichier());
        dto.setDescription(doc.getDescription());
        dto.setDateUpload(doc.getDateUpload());
        dto.setUploadDate(doc.getDateUpload() != null ? doc.getDateUpload().toString() : null);
        dto.setCategory(doc.getType() != null ? doc.getType().name() : null);
        return dto;
    }
}
