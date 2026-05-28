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
    <div class="dashboard">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1>Bonjour, {{ userName }} !</h1>
          <p>Bienvenue sur votre espace sante personnel</p>
        </div>
        <a routerLink="/medecins" class="btn btn-primary btn-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 2v4"/>
            <path d="M16 2v4"/>
            <rect width="18" height="18" x="3" y="4" rx="2"/>
            <path d="M3 10h18"/>
            <path d="M10 14h4"/>
            <path d="M12 12v4"/>
          </svg>
          Prendre un RDV
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4"/>
              <path d="M16 2v4"/>
              <rect width="18" height="18" x="3" y="4" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ upcomingAppointments.length }}</span>
            <span class="stat-label">RDV a venir</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M16 13H8"/>
              <path d="M16 17H8"/>
              <path d="M10 9H8"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ consultations.length }}</span>
            <span class="stat-label">Consultations</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
              <path d="m8.5 8.5 7 7"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ prescriptionsCount }}</span>
            <span class="stat-label">Ordonnances</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ documentsCount }}</span>
            <span class="stat-label">Documents</span>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Upcoming Appointments -->
        <div class="card">
          <div class="card-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 2v4"/>
                <path d="M16 2v4"/>
                <rect width="18" height="18" x="3" y="4" rx="2"/>
                <path d="M3 10h18"/>
              </svg>
              Prochains rendez-vous
            </h2>
            <a routerLink="/patient/appointments" class="link">Voir tout</a>
          </div>

          @if (upcomingAppointments.length > 0) {
            <div class="appointments-list">
              @for (apt of upcomingAppointments.slice(0, 3); track apt.id) {
                <div class="appointment-item">
                  <div class="appointment-avatar">
                    {{ apt.medecinPrenom?.[0] || 'D' }}{{ apt.medecinNom?.[0] || 'r' }}
                  </div>
                  <div class="appointment-info">
                    <h4>Dr. {{ apt.medecinPrenom }} {{ apt.medecinNom }}</h4>
                    <p>{{ apt.medecinSpecialite }}</p>
                  </div>
                  <div class="appointment-datetime">
                    <span class="date">{{ apt.date }}</span>
                    <span class="time">{{ apt.heureDebut }}</span>
                  </div>
                  <span class="badge" [class]="'badge-' + getStatusClass(apt.statut)">
                    {{ getStatusLabel(apt.statut) }}
                  </span>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 2v4"/>
                <path d="M16 2v4"/>
                <rect width="18" height="18" x="3" y="4" rx="2"/>
                <path d="M3 10h18"/>
              </svg>
              <h3>Aucun rendez-vous prevu</h3>
              <p>Prenez votre premier rendez-vous avec un medecin</p>
              <a routerLink="/medecins" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
                Trouver un medecin
              </a>
            </div>
          }
        </div>

        <!-- Recent Consultations -->
        <div class="card">
          <div class="card-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
              </svg>
              Dernieres consultations
            </h2>
            <a routerLink="/patient/medical-record" class="link">Voir tout</a>
          </div>

          @if (consultations.length > 0) {
            <div class="consultations-list">
              @for (consult of consultations.slice(0, 4); track consult.id) {
                <div class="consultation-item">
                  <div class="consult-date-box">
                    <span class="day">{{ consult.dateConsultation | date:'dd' }}</span>
                    <span class="month">{{ consult.dateConsultation | date:'MMM' }}</span>
                  </div>
                  <div class="consult-info">
                    <h4>{{ consult.medecinNom }}</h4>
                    @if (consult.diagnostic) {
                      <p>{{ consult.diagnostic }}</p>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
                <path d="M10 9H8"/>
              </svg>
              <h3>Aucune consultation</h3>
              <p>Votre historique de consultations apparaitra ici</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #1E6FD9 0%, #1550A8 100%);
      border-radius: var(--radius-lg);
      padding: 2rem;
      margin-bottom: 1.5rem;
      color: white;

      h1 {
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
        color: white;
      }

      p {
        opacity: 0.9;
      }

      .btn {
        background: white;
        color: var(--primary);
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:hover {
          background: var(--gray-100);
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      border: 1px solid var(--gray-100);

      .stat-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);

        &.blue {
          background: #DBEAFE;
          color: #1E40AF;
        }

        &.green {
          background: #D1FAE5;
          color: #059669;
        }

        &.purple {
          background: #EDE9FE;
          color: #7C3AED;
        }

        &.orange {
          background: #FEF3C7;
          color: #D97706;
        }
      }

      .stat-info {
        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--gray-500);
        }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--gray-100);

      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-800);

        svg {
          color: var(--gray-400);
        }
      }

      .link {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--primary);
      }
    }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .appointment-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--gray-50);
      border-radius: var(--radius-md);

      .appointment-avatar {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        background: var(--primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        flex-shrink: 0;
      }

      .appointment-info {
        flex: 1;
        min-width: 0;

        h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.125rem;
        }

        p {
          font-size: 0.8125rem;
          color: var(--gray-500);
        }
      }

      .appointment-datetime {
        text-align: right;

        .date, .time {
          display: block;
          font-size: 0.8125rem;
        }

        .date {
          font-weight: 500;
          color: var(--gray-700);
        }

        .time {
          color: var(--gray-500);
        }
      }
    }

    .consultations-list {
      display: flex;
      flex-direction: column;
    }

    .consultation-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--gray-100);

      &:last-child {
        border-bottom: none;
      }

      .consult-date-box {
        width: 48px;
        text-align: center;
        flex-shrink: 0;

        .day {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gray-900);
          line-height: 1;
        }

        .month {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-500);
          text-transform: uppercase;
        }
      }

      .consult-info {
        flex: 1;
        min-width: 0;

        h4 {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--gray-800);
          margin-bottom: 0.125rem;
        }

        p {
          font-size: 0.8125rem;
          color: var(--gray-500);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1.5rem;
      text-align: center;

      svg {
        color: var(--gray-300);
        margin-bottom: 1rem;
      }

      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 0.375rem;
      }

      p {
        font-size: 0.875rem;
        color: var(--gray-500);
        margin-bottom: 1.25rem;
      }

      .btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    @media (max-width: 640px) {
      .welcome-section {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;

        .welcome-content {
          order: 1;
        }
      }

      .appointment-item {
        flex-wrap: wrap;

        .appointment-datetime {
          order: 3;
          width: 100%;
          text-align: left;
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .badge {
          order: 4;
        }
      }
    }
  `]
})
export class PatientDashboardComponent implements OnInit {
  userName = '';
  upcomingAppointments: Appointment[] = [];
  consultations: Consultation[] = [];
  prescriptionsCount = 0;
  documentsCount = 0;

  constructor(
    private appointmentService: AppointmentService,
    private consultationService: ConsultationService,
    private authService: AuthService
  ) {
    const user = this.authService.user();
    if (user) {
      this.userName = user.prenom || '';
    }
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
      next: (data) => {
        this.consultations = data;
        this.prescriptionsCount = data.filter(c => c.prescriptions && c.prescriptions.length > 0).length;
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

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'CONFIRME': return 'Confirme';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULE': return 'Annule';
      case 'TERMINE': return 'Termine';
      default: return statut;
    }
  }
}
