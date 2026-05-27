package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "secretaires")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Secretaire extends User {

    @ManyToOne
    @JoinColumn(name = "clinique_id")
    private Clinique clinique;
}
