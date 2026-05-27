package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private String nom;

    @Enumerated(EnumType.STRING)
    private TypeDocument type;

    private String cheminFichier;

    private String typeMime;

    private Long tailleFichier;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime dateUpload;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @PrePersist
    protected void onCreate() {
        dateUpload = LocalDateTime.now();
    }
}
