import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Patient, Medecin } from '../../../core/models/user.model';
import { Appointment, Creneau, AppointmentCreateRequest } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-secretaire-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Espace Secretaire</h1>
        <p>Gestion des rendez-vous et patients</p>
      </div>

      <div class="content-grid">
        <div class="card">
          <h2>Rechercher un patient</h2>
          <div class="form-group">
            <input type="text" [(ngModel)]="searchQuery" (input)="searchPatients()" placeholder="Nom ou prenom...">
          </div>
          <div class="patients-list">
            @for (patient of patients; track patient.id) {
              <div class="patient-item" (click)="selectPatient(patient)" [class.selected]="selectedPatient?.id === patient.id">
                <strong>{{ patient.prenom }} {{ patient.nom }}</strong>
                <span>{{ patient.email }}</span>
              </div>
            }
          </div>
        </div>

        <div class="card">
          <h2>Prendre un rendez-vous</h2>
          @if (selectedPatient) {
            <div class="selected-patient">
              Patient: <strong>{{ selectedPatient.prenom }} {{ selectedPatient.nom }}</strong>
            </div>

            <div class="form-group">
              <label>Medecin</label>
              <select [(ngModel)]="selectedMedecinId" (change)="onMedecinChange()">
                <option [ngValue]="null">Selectionner un medecin</option>
                @for (medecin of medecins; track medecin.id) {
                  <option [ngValue]="medecin.id">Dr. {{ medecin.prenom }} {{ medecin.nom }} - {{ medecin.specialite }}</option>
                }
              </select>
            </div>

            @if (selectedMedecinId) {
              <div class="form-group">
                <label>Date</label>
                <input type="date" [(ngModel)]="selectedDate" (change)="loadCreneaux()" [min]="minDate">
              </div>

              @if (creneaux.length > 0) {
                <div class="form-group">
                  <label>Creneau</label>
                  <div class="creneaux-grid">
                    @for (creneau of creneaux; track creneau.heureDebut) {
                      <button
                        class="creneau-btn"
                        [class.selected]="selectedCreneau?.heureDebut === creneau.heureDebut"
                        [disabled]="!creneau.disponible"
                        (click)="selectCreneau(creneau)">
                        {{ creneau.heureDebut }}
                      </button>
                    }
                  </div>
                </div>

                @if (selectedCreneau) {
                  <div class="form-group">
                    <label>Motif</label>
                    <select [(ngModel)]="selectedMotif">
                      <option value="CONSULTATION_GENERALE">Consultation generale</option>
                      <option value="SUIVI">Suivi</option>
                      <option value="URGENCE">Urgence</option>
                    </select>
                  </div>

                  <button class="btn btn-primary" (click)="createAppointment()">Creer le RDV</button>
                }
              }
            }
          } @else {
            <p class="empty-state">Selectionnez un patient</p>
          }

          @if (success) {
            <div class="alert alert-success mt-4">Rendez-vous cree avec succes!</div>
          }
        </div>

        <div class="card">
          <h2>RDV du jour</h2>
          @for (apt of todayAppointments; track apt.id) {
            <div class="appointment-row">
              <span class="apt-time">{{ apt.heureDebut }}</span>
              <div class="apt-info">
                <strong>{{ apt.patientPrenom }} {{ apt.patientNom }}</strong>
                <span>Dr. {{ apt.medecinNom }}</span>
              </div>
              <span class="badge" [class]="'badge-' + getStatusClass(apt.statut)">{{ apt.statut }}</span>
              @if (apt.statut === 'EN_ATTENTE') {
                <button class="btn btn-success btn-sm" (click)="confirmAppointment(apt.id)">Confirmer</button>
              }
            </div>
          } @empty {
            <p class="empty-state">Aucun RDV aujourd'hui</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr 1fr;
      gap: 1.5rem;

      @media (max-width: 1200px) {
        grid-template-columns: 1fr 1fr;
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    h2 { margin-bottom: 1rem; }

    .patients-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .patient-item {
      padding: 0.75rem;
      border: 1px solid var(--gray-200);
      border-radius: 0.375rem;
      cursor: pointer;
      margin-bottom: 0.5rem;

      &:hover { background: var(--gray-50); }
      &.selected { border-color: var(--primary); background: #eff6ff; }

      strong { display: block; }
      span { font-size: 0.75rem; color: var(--gray-500); }
    }

    .selected-patient {
      padding: 0.75rem;
      background: var(--gray-100);
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }

    .creneaux-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    .creneau-btn {
      padding: 0.5rem;
      border: 1px solid var(--gray-300);
      border-radius: 0.375rem;
      background: white;
      cursor: pointer;

      &:hover:not(:disabled) { border-color: var(--primary); }
      &.selected { background: var(--primary); color: white; }
      &:disabled { background: var(--gray-100); color: var(--gray-400); cursor: not-allowed; }
    }

    .appointment-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--gray-100);

      .apt-time { font-weight: 600; min-width: 50px; }
      .apt-info { flex: 1; strong { display: block; } span { font-size: 0.75rem; color: var(--gray-500); } }
    }

    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
    .empty-state { text-align: center; padding: 2rem; color: var(--gray-500); }
  `]
})
export class SecretaireDashboardComponent implements OnInit {
  patients: Patient[] = [];
  medecins: Medecin[] = [];
  todayAppointments: Appointment[] = [];
  creneaux: Creneau[] = [];

  searchQuery = '';
  selectedPatient: Patient | null = null;
  selectedMedecinId: number | null = null;
  selectedDate = '';
  selectedCreneau: Creneau | null = null;
  selectedMotif = 'CONSULTATION_GENERALE';
  minDate = new Date().toISOString().split('T')[0];
  success = false;

  constructor(
    private patientService: PatientService,
    private medecinService: MedecinService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.loadMedecins();
    this.loadTodayAppointments();
  }

  searchPatients(): void {
    if (this.searchQuery.length < 2) {
      this.patients = [];
      return;
    }
    this.patientService.searchPatients(this.searchQuery).subscribe({
      next: (data) => this.patients = data
    });
  }

  loadMedecins(): void {
    this.medecinService.getAllMedecins().subscribe({
      next: (data) => this.medecins = data
    });
  }

  loadTodayAppointments(): void {
    // Load all appointments for today from multiple medecins
    const today = new Date().toISOString().split('T')[0];
    this.medecins.forEach(m => {
      this.appointmentService.getAppointmentsByMedecinAndDate(m.id, today).subscribe({
        next: (data) => this.todayAppointments = [...this.todayAppointments, ...data]
      });
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
  }

  onMedecinChange(): void {
    this.selectedCreneau = null;
    this.creneaux = [];
    this.selectedDate = '';
  }

  loadCreneaux(): void {
    if (!this.selectedMedecinId || !this.selectedDate) return;
    this.medecinService.getCreneauxDisponibles(this.selectedMedecinId, this.selectedDate).subscribe({
      next: (data) => this.creneaux = data
    });
  }

  selectCreneau(creneau: Creneau): void {
    if (creneau.disponible) {
      this.selectedCreneau = creneau;
    }
  }

  createAppointment(): void {
    if (!this.selectedPatient || !this.selectedMedecinId || !this.selectedCreneau) return;

    const request: AppointmentCreateRequest = {
      patientId: this.selectedPatient.id,
      medecinId: this.selectedMedecinId,
      date: this.selectedDate,
      heureDebut: this.selectedCreneau.heureDebut,
      motif: this.selectedMotif as any
    };

    this.appointmentService.createSecretaireAppointment(request).subscribe({
      next: () => {
        this.success = true;
        this.selectedCreneau = null;
        this.loadCreneaux();
        setTimeout(() => this.success = false, 3000);
      }
    });
  }

  confirmAppointment(id: number): void {
    this.appointmentService.confirmSecretaireAppointment(id).subscribe({
      next: () => {
        const apt = this.todayAppointments.find(a => a.id === id);
        if (apt) apt.statut = 'CONFIRME';
      }
    });
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'CONFIRME': return 'success';
      case 'EN_ATTENTE': return 'warning';
      case 'ANNULE': return 'danger';
      default: return 'info';
    }
  }
}
