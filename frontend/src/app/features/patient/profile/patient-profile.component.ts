import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/user.model';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Mon profil</h1>
        <p>Gerez vos informations personnelles</p>
      </div>

      @if (success) {
        <div class="alert alert-success">Profil mis a jour avec succes</div>
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      <div class="card">
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Prenom</label>
              <input type="text" formControlName="prenom">
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input type="text" formControlName="nom">
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" readonly>
          </div>

          <div class="form-group">
            <label>Telephone</label>
            <input type="tel" formControlName="telephone">
          </div>

          <div class="form-group">
            <label>Date de naissance</label>
            <input type="date" formControlName="dateNaissance">
          </div>

          <div class="form-group">
            <label>Adresse</label>
            <input type="text" formControlName="adresse">
          </div>

          <div class="form-group">
            <label>Groupe sanguin</label>
            <select formControlName="groupeSanguin">
              <option value="">Selectionner</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div class="form-group">
            <label>Allergies</label>
            <textarea formControlName="allergies" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Antecedents medicaux</label>
            <textarea formControlName="antecedents" rows="3"></textarea>
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loading || profileForm.invalid">
            {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    textarea {
      resize: vertical;
    }
  `]
})
export class PatientProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  success = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {
    this.profileForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: [''],
      telephone: [''],
      dateNaissance: [''],
      adresse: [''],
      groupeSanguin: [''],
      allergies: [''],
      antecedents: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.patientService.getProfile().subscribe({
      next: (patient) => {
        this.profileForm.patchValue({
          prenom: patient.prenom,
          nom: patient.nom,
          email: patient.email,
          telephone: patient.telephone,
          dateNaissance: patient.dateNaissance,
          adresse: patient.adresse,
          groupeSanguin: patient.groupeSanguin,
          allergies: patient.allergies,
          antecedents: patient.antecedents
        });
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.success = false;
    this.error = '';

    this.patientService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de la mise a jour';
        this.loading = false;
      }
    });
  }
}
