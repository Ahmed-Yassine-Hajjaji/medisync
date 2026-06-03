package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admin extends User {

    @ManyToOne
    @JoinColumn(name = "clinique_id")
    private Clinique clinique;

}
