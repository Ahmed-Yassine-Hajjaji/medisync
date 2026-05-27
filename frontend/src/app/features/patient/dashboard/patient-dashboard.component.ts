import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Consultation } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Bonjour, {{ userName }}</h1>
        <p>Bienvenue sur votre espace patient</p>
      </div>

      <div class="quick-actions">
        <a routerLink="/medecins" class="action-card card">
          <div class="action-icon">📅</div>
          <h3>Prendre RDV</h3>
          <p>Trouver un medecin</p>
        </a>
        <a routerLink="appointments" class="action-card card">
          <div class="action-icon">📋</div>
          <h3>Mes RDV</h3>
          <p>{{ upcomingAppointments.length }} a venir</p>
        </a>
        <a routerLink="consultations" class="action-card card">
          <div class="action-icon">📄</div>
          <h3>Mon dossier</h3>
          <p>{{ consultations.length }} consultations</p>
        </a>
        <a routerLink="profile" class="action-card card">
          <div class="action-icon">👤</div>
          <h3>Mon profil</h3>
          <p>Mes informations</p>
        </a>
      </div>

      <div class="content-grid">
        <div class="card">
          <h2>Prochains rendez-vous</h2>
          @for (apt of upcomingAppointments.slice(0, 3); track apt.id) {
            <div class="appointment-item">
              <div class="apt-info">
                <strong>Dr. {{ apt.medecinPrenom }} {{ apt.medecinNom }}</strong>
                <span class="apt-specialty">{{ apt.medecinSpecialite }}</span>
              </div>
              <div class="apt-date">
                <span>{{ apt.date }}</span>
                <span>{{ apt.heureDebut }}</span>
              </div>
              <span class="badge" [class]="'badge-' + getStatusClass(apt.statut)">
                {{ apt.statut }}
              </span>
            </div>
          } @empty {
            <p class="empty-state">Aucun rendez-vous a venir</p>
          }
          @if (upcomingAppointments.length > 3) {
            <a routerLink="appointments" class="view-all">Voir tous les rendez-vous</a>
          }
        </div>

        <div class="card">
          <h2>Dernieres consultations</h2>
          @for (consult of consultations.slice(0, 3); track consult.id) {
            <div class="consultation-item">
              <div class="consult-info">
                <strong>{{ consult.medecinNom }}</strong>
                <span class="consult-date">{{ consult.dateConsultation | date:'dd/MM/yyyy' }}</span>
              </div>
              @if (consult.diagnostic) {
                <p class="consult-diagnostic">{{ consult.diagnostic }}</p>
              }
            </div>
          } @empty {
            <p class="empty-state">Aucune consultation</p>
          }
          @if (consultations.length > 3) {
            <a routerLink="consultations" class="view-all">Voir tout le dossier</a>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .action-card {
      text-align: center;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .action-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      h3 {
        font-size: 1rem;
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.875rem;
        color: var(--gray-500);
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      h2 {
        font-size: 1.125rem;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--gray-200);
      }
    }

    .appointment-item, .consultation-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--gray-100);

      &:last-of-type {
        border-bottom: none;
      }
    }

    .apt-info, .consult-info {
      flex: 1;

      strong {
        display: block;
        font-size: 0.875rem;
      }

      span {
        font-size: 0.75rem;
        color: var(--gray-500);
      }
    }

    .apt-date {
      text-align: right;
      font-size: 0.875rem;

      span {
        display: block;
      }
    }

    .consult-diagnostic {
      font-size: 0.75rem;
      color: var(--gray-600);
      margin-top: 0.25rem;
    }

    .empty-state {
      color: var(--gray-500);
      text-align: center;
      padding: 2rem;
    }

    .view-all {
      display: block;
      text-align: center;
      margin-top: 1rem;
      color: var(--primary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }
  `]
})
export class PatientDashboardComponent implements OnInit {
  userName = '';
  upcomingAppointments: Appointment[] = [];
  consultations: Consultation[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private consultationService: ConsultationService,
    private authService: AuthService
  ) {
    const user = this.authService.user();
    this.userName = user ? user.prenom : '';
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.loadConsultations();
  }

  loadAppointments(): void {
    this.appointmentService.getPatientAppointments().subscribe({
      next: (data) => {
        this.upcomingAppointments = data.filter(a =>
          a.statut !== 'ANNULE' && a.statut !== 'TERMINE' && a.statut !== 'NO_SHOW'
        );
      }
    });
  }

  loadConsultations(): void {
    this.consultationService.getPatientConsultations().subscribe({
      next: (data) => this.consultations = data
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
