import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Consultation } from '../../../core/models/consultation.model';
import { SidebarComponent, NavItem } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <app-sidebar [navItems]="navItems"></app-sidebar>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Header -->
        <header class="dashboard-header">
          <div class="header-left">
            <h1>Bonjour, {{ userName }} !</h1>
            <p>Bienvenue sur votre espace sante</p>
          </div>
          <div class="header-right">
            <button class="notification-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
              @if (notificationCount > 0) {
                <span class="notification-badge">{{ notificationCount }}</span>
              }
            </button>
            <div class="user-avatar">
              <div class="avatar avatar-lg">{{ userInitials }}</div>
            </div>
          </div>
        </header>

        <!-- Quick Actions -->
        <section class="quick-actions">
          <a routerLink="/medecins" class="action-card primary">
            <div class="action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 2v4"/>
                <path d="M16 2v4"/>
                <rect width="18" height="18" x="3" y="4" rx="2"/>
                <path d="M3 10h18"/>
                <path d="M10 14h4"/>
                <path d="M12 12v4"/>
              </svg>
            </div>
            <div class="action-content">
              <h3>Prendre RDV</h3>
              <p>Trouver un medecin</p>
            </div>
            <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </a>

          <a routerLink="appointments" class="action-card">
            <div class="action-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/>
                <path d="M12 11h4"/>
                <path d="M12 16h4"/>
                <path d="M8 11h.01"/>
                <path d="M8 16h.01"/>
              </svg>
            </div>
            <div class="action-content">
              <h3>Mes rendez-vous</h3>
              <p>{{ upcomingAppointments.length }} a venir</p>
            </div>
          </a>

          <a routerLink="consultations" class="action-card">
            <div class="action-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
                <path d="M10 9H8"/>
              </svg>
            </div>
            <div class="action-content">
              <h3>Dossier medical</h3>
              <p>{{ consultations.length }} consultations</p>
            </div>
          </a>

          <a routerLink="profile" class="action-card">
            <div class="action-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="5"/>
                <path d="M20 21a8 8 0 0 0-16 0"/>
              </svg>
            </div>
            <div class="action-content">
              <h3>Mon profil</h3>
              <p>Informations personnelles</p>
            </div>
          </a>
        </section>

        <!-- Content Grid -->
        <div class="content-grid">
          <!-- Upcoming Appointments -->
          <section class="card appointments-section">
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
              <a routerLink="appointments" class="view-all-link">Voir tout</a>
            </div>

            <div class="appointments-list">
              @for (apt of upcomingAppointments.slice(0, 3); track apt.id) {
                <div class="appointment-card">
                  <div class="doctor-avatar">
                    <div class="avatar avatar-lg">
                      {{ apt.medecinPrenom?.[0] }}{{ apt.medecinNom?.[0] }}
                    </div>
                  </div>
                  <div class="appointment-info">
                    <h4>Dr. {{ apt.medecinPrenom }} {{ apt.medecinNom }}</h4>
                    <p class="specialty">{{ apt.medecinSpecialite }}</p>
                    <div class="appointment-meta">
                      <span class="date">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M8 2v4"/>
                          <path d="M16 2v4"/>
                          <rect width="18" height="18" x="3" y="4" rx="2"/>
                          <path d="M3 10h18"/>
                        </svg>
                        {{ apt.date }}
                      </span>
                      <span class="time">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {{ apt.heureDebut }}
                      </span>
                    </div>
                  </div>
                  <span class="badge" [class]="'badge-' + getStatusClass(apt.statut)">
                    {{ getStatusLabel(apt.statut) }}
                  </span>
                </div>
              } @empty {
                <div class="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 2v4"/>
                    <path d="M16 2v4"/>
                    <rect width="18" height="18" x="3" y="4" rx="2"/>
                    <path d="M3 10h18"/>
                  </svg>
                  <p>Aucun rendez-vous a venir</p>
                  <a routerLink="/medecins" class="btn btn-primary">Prendre rendez-vous</a>
                </div>
              }
            </div>
          </section>

          <!-- Recent Consultations -->
          <section class="card consultations-section">
            <div class="card-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                </svg>
                Dernieres consultations
              </h2>
              <a routerLink="consultations" class="view-all-link">Voir tout</a>
            </div>

            <div class="consultations-list">
              @for (consult of consultations.slice(0, 4); track consult.id) {
                <div class="consultation-item">
                  <div class="consult-date">
                    <span class="day">{{ consult.dateConsultation | date:'dd' }}</span>
                    <span class="month">{{ consult.dateConsultation | date:'MMM' }}</span>
                  </div>
                  <div class="consult-info">
                    <h4>{{ consult.medecinNom }}</h4>
                    @if (consult.diagnostic) {
                      <p>{{ consult.diagnostic }}</p>
                    }
                  </div>
                  <button class="btn btn-sm btn-secondary">Voir</button>
                </div>
              } @empty {
                <div class="empty-state small">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                  <p>Aucune consultation</p>
                </div>
              }
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background: var(--gray-50);
    }

    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: 2rem;
      transition: margin-left 0.3s;
    }

    // Header
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      .header-left {
        h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }

        p {
          color: var(--gray-500);
          font-size: 0.9375rem;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
    }

    .notification-btn {
      position: relative;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      color: var(--gray-600);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--gray-50);
        color: var(--gray-900);
      }

      .notification-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        background: var(--danger);
        color: var(--white);
        font-size: 0.6875rem;
        font-weight: 600;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
      }
    }

    .user-avatar {
      cursor: pointer;
    }

    // Quick Actions
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      border: 1px solid var(--gray-100);
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      &.primary {
        background: var(--primary);
        border-color: var(--primary);
        color: var(--white);

        .action-icon {
          background: rgba(255, 255, 255, 0.2);
          color: var(--white);
        }

        .action-content p {
          color: rgba(255, 255, 255, 0.8);
        }

        .action-arrow {
          color: rgba(255, 255, 255, 0.6);
        }

        &:hover {
          background: var(--primary-dark);
        }
      }

      .action-icon {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        background: var(--primary-light);
        color: var(--primary);
        flex-shrink: 0;

        &.blue {
          background: #E0F2FE;
          color: #0284C7;
        }

        &.green {
          background: #D1FAE5;
          color: #059669;
        }

        &.purple {
          background: #EDE9FE;
          color: #7C3AED;
        }
      }

      .action-content {
        flex: 1;

        h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.125rem;
        }

        p {
          font-size: 0.8125rem;
          color: var(--gray-500);
        }
      }

      .action-arrow {
        color: var(--gray-400);
      }
    }

    // Content Grid
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
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
        font-size: 1.0625rem;
        font-weight: 600;
        color: var(--gray-800);

        svg {
          color: var(--gray-400);
        }
      }

      .view-all-link {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--primary);

        &:hover {
          text-decoration: underline;
        }
      }
    }

    // Appointments
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .appointment-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--gray-50);
      border-radius: var(--radius-md);
      transition: background 0.2s;

      &:hover {
        background: var(--gray-100);
      }

      .doctor-avatar {
        flex-shrink: 0;

        .avatar {
          background: var(--primary);
          color: var(--white);
        }
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

        .specialty {
          font-size: 0.8125rem;
          color: var(--gray-500);
          margin-bottom: 0.5rem;
        }

        .appointment-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.8125rem;
          color: var(--gray-600);

          span {
            display: flex;
            align-items: center;
            gap: 0.25rem;

            svg {
              color: var(--gray-400);
            }
          }
        }
      }
    }

    // Consultations
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

      .consult-date {
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

    // Empty State
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;

      svg {
        color: var(--gray-300);
        margin-bottom: 1rem;
      }

      p {
        color: var(--gray-500);
        margin-bottom: 1.5rem;
      }

      &.small {
        padding: 2rem 1rem;

        svg {
          margin-bottom: 0.5rem;
        }

        p {
          margin-bottom: 0;
          font-size: 0.875rem;
        }
      }
    }

    // Responsive
    @media (max-width: 1024px) {
      .quick-actions {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
        padding: 1rem;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;

        .header-right {
          width: 100%;
          justify-content: flex-end;
        }
      }

      .action-card {
        .action-arrow {
          display: none;
        }
      }

      .appointment-card {
        flex-wrap: wrap;

        .badge {
          width: 100%;
          justify-content: center;
          margin-top: 0.5rem;
        }
      }
    }
  `]
})
export class PatientDashboardComponent implements OnInit {
  userName = '';
  userInitials = '';
  upcomingAppointments: Appointment[] = [];
  consultations: Consultation[] = [];
  notificationCount = 0;

  navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
      route: ''
    },
    {
      label: 'Mes rendez-vous',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
      route: 'appointments'
    },
    {
      label: 'Consultations',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
      route: 'consultations'
    },
    {
      label: 'Ordonnances',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
      route: 'prescriptions'
    },
    {
      label: 'Factures',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
      route: 'invoices'
    },
    {
      label: 'Mon profil',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`,
      route: 'profile'
    }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private consultationService: ConsultationService,
    private authService: AuthService
  ) {
    const user = this.authService.user();
    if (user) {
      this.userName = user.prenom || '';
      this.userInitials = `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
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
        this.notificationCount = this.upcomingAppointments.filter(a => a.statut === 'EN_ATTENTE').length;
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
