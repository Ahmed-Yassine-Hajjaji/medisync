import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="appointments-page">
      <div class="page-header">
        <div>
          <h1>Mes rendez-vous</h1>
          <p>Gerez vos rendez-vous medicaux</p>
        </div>
        <a routerLink="/medecins" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
          Nouveau RDV
        </a>
      </div>

      @if (appointments.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4"/>
              <path d="M16 2v4"/>
              <rect width="18" height="18" x="3" y="4" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
          </div>
          <h3>Aucun rendez-vous</h3>
          <p>Vous n'avez pas encore de rendez-vous. Prenez rendez-vous avec un medecin pour commencer.</p>
          <a routerLink="/medecins" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            Trouver un medecin
          </a>
        </div>
      } @else {
        <!-- Upcoming Appointments -->
        @if (upcomingAppointments.length > 0) {
          <div class="section">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              A venir
            </h2>
            <div class="appointments-grid">
              @for (apt of upcomingAppointments; track apt.id) {
                <div class="appointment-card" [class.confirmed]="apt.statut === 'CONFIRME'" [class.pending]="apt.statut === 'EN_ATTENTE'">
                  <div class="apt-date">
                    <span class="day">{{ getDay(apt.date) }}</span>
                    <span class="month">{{ getMonth(apt.date) }}</span>
                  </div>
                  <div class="apt-details">
                    <div class="apt-time">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {{ apt.heureDebut }} - {{ apt.heureFin }}
                    </div>
                    <h4>Dr. {{ apt.medecinPrenom }} {{ apt.medecinNom }}</h4>
                    <span class="apt-specialite">{{ apt.medecinSpecialite }}</span>
                    <span class="apt-motif">{{ formatMotif(apt.motif) }}</span>
                  </div>
                  <div class="apt-actions">
                    <span class="badge" [class]="'badge-' + getStatusClass(apt.statut)">
                      @if (apt.statut === 'CONFIRME') {
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                      }
                      {{ getStatusLabel(apt.statut) }}
                    </span>
                    <button class="btn-cancel" (click)="cancelAppointment(apt.id)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m15 9-6 6"/>
                        <path d="m9 9 6 6"/>
                      </svg>
                      Annuler
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Past Appointments -->
        @if (pastAppointments.length > 0) {
          <div class="section">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M12 7v5l4 2"/>
              </svg>
              Historique
            </h2>
            <div class="appointments-list">
              @for (apt of pastAppointments; track apt.id) {
                <div class="appointment-row" [class.cancelled]="apt.statut === 'ANNULE'">
                  <div class="row-date">{{ formatDate(apt.date) }}</div>
                  <div class="row-time">{{ apt.heureDebut }}</div>
                  <div class="row-medecin">Dr. {{ apt.medecinPrenom }} {{ apt.medecinNom }}</div>
                  <div class="row-specialite">{{ apt.medecinSpecialite }}</div>
                  <span class="badge" [class]="'badge-' + getStatusClass(apt.statut)">
                    {{ getStatusLabel(apt.statut) }}
                  </span>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .appointments-page {
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      h1 {
        margin: 0 0 0.25rem 0;
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--gray-900);
      }

      p {
        margin: 0;
        color: var(--gray-500);
      }

      .btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-weight: 500;
      font-family: inherit;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--primary-dark);
      }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);

      .empty-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 1.5rem;
        background: var(--primary-light);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
      }

      h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--gray-900);
      }

      p {
        margin: 0 auto 1.5rem;
        color: var(--gray-500);
        max-width: 400px;
        line-height: 1.5;
      }
    }

    /* Sections */
    .section {
      margin-bottom: 2rem;

      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-700);
      }
    }

    /* Appointments Grid */
    .appointments-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .appointment-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      transition: box-shadow 0.2s;

      &:hover {
        box-shadow: var(--shadow-md);
      }

      &.confirmed {
        border-left: 3px solid var(--success);
      }

      &.pending {
        border-left: 3px solid #F59E0B;
      }
    }

    .apt-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background: var(--primary-light);
      border-radius: var(--radius-md);
      flex-shrink: 0;

      .day {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary);
        line-height: 1;
      }

      .month {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--primary);
        text-transform: uppercase;
      }
    }

    .apt-details {
      flex: 1;

      .apt-time {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        color: var(--gray-500);
        margin-bottom: 0.25rem;
      }

      h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
      }

      .apt-specialite {
        display: block;
        font-size: 0.875rem;
        color: var(--primary);
      }

      .apt-motif {
        display: block;
        font-size: 0.8125rem;
        color: var(--gray-500);
        margin-top: 0.25rem;
      }
    }

    .apt-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.75rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 500;

      &.badge-success {
        background: #DCFCE7;
        color: #16A34A;
      }

      &.badge-warning {
        background: #FEF3C7;
        color: #D97706;
      }

      &.badge-danger {
        background: #FEE2E2;
        color: #DC2626;
      }

      &.badge-info {
        background: var(--primary-light);
        color: var(--primary);
      }
    }

    .btn-cancel {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      background: transparent;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-family: inherit;
      color: var(--gray-600);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #FEE2E2;
        border-color: #FECACA;
        color: #DC2626;
      }
    }

    /* Past Appointments List */
    .appointments-list {
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .appointment-row {
      display: grid;
      grid-template-columns: 120px 80px 1fr 150px 100px;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--gray-100);
      font-size: 0.875rem;

      &:last-child {
        border-bottom: none;
      }

      &.cancelled {
        opacity: 0.6;
      }

      .row-date {
        color: var(--gray-700);
        font-weight: 500;
      }

      .row-time {
        color: var(--gray-500);
      }

      .row-medecin {
        color: var(--gray-900);
        font-weight: 500;
      }

      .row-specialite {
        color: var(--gray-500);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .appointment-card {
        flex-direction: column;
        align-items: flex-start;
      }

      .apt-actions {
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
      }

      .appointment-row {
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;

        .row-specialite {
          display: none;
        }
      }
    }
  `]
})
export class PatientAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  pastAppointments: Appointment[] = [];

  private months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getPatientAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.categorizeAppointments();
      }
    });
  }

  categorizeAppointments(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingAppointments = this.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && (apt.statut === 'EN_ATTENTE' || apt.statut === 'CONFIRME');
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.pastAppointments = this.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate < today || apt.statut === 'TERMINE' || apt.statut === 'ANNULE';
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  cancelAppointment(id: number): void {
    if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
      this.appointmentService.cancelPatientAppointment(id).subscribe({
        next: () => this.loadAppointments()
      });
    }
  }

  getDay(dateStr: string): string {
    return new Date(dateStr).getDate().toString();
  }

  getMonth(dateStr: string): string {
    return this.months[new Date(dateStr).getMonth()];
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatMotif(motif: string): string {
    const labels: Record<string, string> = {
      'CONSULTATION_GENERALE': 'Consultation generale',
      'SUIVI': 'Suivi',
      'URGENCE': 'Urgence',
      'VACCINATION': 'Vaccination',
      'CERTIFICAT_MEDICAL': 'Certificat medical',
      'RENOUVELLEMENT_ORDONNANCE': 'Renouvellement ordonnance'
    };
    return labels[motif] || motif;
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'CONFIRME': return 'success';
      case 'EN_ATTENTE': return 'warning';
      case 'ANNULE': return 'danger';
      case 'TERMINE': return 'info';
      default: return 'info';
    }
  }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'CONFIRME': 'Confirme',
      'EN_ATTENTE': 'En attente',
      'ANNULE': 'Annule',
      'TERMINE': 'Termine'
    };
    return labels[statut] || statut;
  }
}
