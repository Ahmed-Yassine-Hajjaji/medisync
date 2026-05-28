import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-medecin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Bonjour, Dr. {{ userName }}</h1>
        <p>{{ today | date:'EEEE d MMMM yyyy' }}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-value">{{ todayAppointments.length }}</div>
          <div class="stat-label">RDV aujourd'hui</div>
        </div>
        <div class="stat-card card">
          <div class="stat-value">{{ pendingAppointments.length }}</div>
          <div class="stat-label">En attente</div>
        </div>
        <div class="stat-card card">
          <div class="stat-value">{{ confirmedAppointments.length }}</div>
          <div class="stat-label">Confirmes</div>
        </div>
      </div>

      <div class="quick-actions">
        <a routerLink="planning" class="action-card card">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4"/>
              <path d="M16 2v4"/>
              <rect width="18" height="18" x="3" y="4" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
          </div>
          <h3>Mon planning</h3>
          <p>Gerer mes disponibilites</p>
        </a>
        <a routerLink="consultations" class="action-card card">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M16 13H8"/>
              <path d="M16 17H8"/>
              <path d="M10 9H8"/>
            </svg>
          </div>
          <h3>Consultations</h3>
          <p>Gerer les dossiers patients</p>
        </a>
      </div>

      <div class="card">
        <h2>Rendez-vous du jour</h2>
        @for (apt of todayAppointments; track apt.id) {
          <div class="appointment-row">
            <div class="apt-time">{{ apt.heureDebut }}</div>
            <div class="apt-info">
              <strong>{{ apt.patientPrenom }} {{ apt.patientNom }}</strong>
              <span>{{ apt.motif }}</span>
            </div>
            <span class="badge" [class]="'badge-' + getStatusClass(apt.statut)">{{ apt.statut }}</span>
            <div class="apt-actions">
              @if (apt.statut === 'EN_ATTENTE') {
                <button class="btn btn-success btn-sm" (click)="confirmAppointment(apt.id)">Confirmer</button>
              }
              @if (apt.statut === 'CONFIRME') {
                <a [routerLink]="['consultations']" [queryParams]="{aptId: apt.id}" class="btn btn-primary btn-sm">Consulter</a>
              }
            </div>
          </div>
        } @empty {
          <p class="empty-state">Aucun rendez-vous aujourd'hui</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      text-align: center;

      .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary);
      }

      .stat-label {
        color: var(--gray-500);
      }
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .action-card {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      &:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .action-icon {
        width: 48px;
        height: 48px;
        background: var(--primary-light);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
        margin-bottom: 0.75rem;
      }

      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
      }

      p {
        color: var(--gray-500);
        font-size: 0.875rem;
        margin: 0;
      }
    }

    h2 {
      margin-bottom: 1rem;
    }

    .appointment-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--gray-100);

      .apt-time {
        font-weight: 600;
        font-size: 1.125rem;
        min-width: 60px;
      }

      .apt-info {
        flex: 1;

        strong {
          display: block;
        }

        span {
          font-size: 0.875rem;
          color: var(--gray-500);
        }
      }

      .apt-actions {
        display: flex;
        gap: 0.5rem;
      }
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--gray-500);
    }
  `]
})
export class MedecinDashboardComponent implements OnInit {
  userName = '';
  today = new Date();
  todayAppointments: Appointment[] = [];
  pendingAppointments: Appointment[] = [];
  confirmedAppointments: Appointment[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {
    const user = this.authService.user();
    this.userName = user ? user.nom : '';
  }

  ngOnInit(): void {
    this.loadTodayAppointments();
  }

  loadTodayAppointments(): void {
    const todayStr = this.today.toISOString().split('T')[0];
    this.appointmentService.getMedecinAppointmentsByDate(todayStr).subscribe({
      next: (data) => {
        this.todayAppointments = data;
        this.pendingAppointments = data.filter(a => a.statut === 'EN_ATTENTE');
        this.confirmedAppointments = data.filter(a => a.statut === 'CONFIRME');
      }
    });
  }

  confirmAppointment(id: number): void {
    this.appointmentService.confirmAppointment(id).subscribe({
      next: () => this.loadTodayAppointments()
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
