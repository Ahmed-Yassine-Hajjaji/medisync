import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-medecin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FullCalendarModule,
    CardModule, ButtonModule, BadgeModule, TagModule, DialogModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <header class="dash-header">
      <div>
        <h1>Bonjour, Dr. {{ userName }}</h1>
        <p class="date-fr">{{ todayFrench }}</p>
      </div>
      <p-button
        label="Ajouter urgence"
        icon="pi pi-exclamation-triangle"
        styleClass="p-button-danger p-button-lg"
        (onClick)="showUrgenceDialog = true"></p-button>
    </header>

    <!-- KPI -->
    <div class="kpi-grid">
      <p-card>
        <div class="kpi">
          <i class="pi pi-calendar-clock kpi-icon-blue"></i>
          <div>
            <div class="kpi-value">{{ todayAppointments.length }}</div>
            <div class="kpi-label">RDV aujourd'hui</div>
          </div>
        </div>
      </p-card>
      <p-card>
        <div class="kpi">
          <i class="pi pi-clock kpi-icon-orange"></i>
          <div>
            <div class="kpi-value">{{ pendingCount }}</div>
            <div class="kpi-label">En attente</div>
          </div>
        </div>
      </p-card>
      <p-card>
        <div class="kpi">
          <i class="pi pi-check-circle kpi-icon-green"></i>
          <div>
            <div class="kpi-value">{{ confirmedCount }}</div>
            <div class="kpi-label">Confirmés</div>
          </div>
        </div>
      </p-card>
      <p-card>
        <div class="kpi">
          <i class="pi pi-users kpi-icon-purple"></i>
          <div>
            <div class="kpi-value">{{ uniquePatientsToday }}</div>
            <div class="kpi-label">Patients du jour</div>
          </div>
        </div>
      </p-card>
    </div>

    <div class="content-grid">
      <!-- Planning -->
      <p-card styleClass="calendar-card">
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2><i class="pi pi-calendar"></i> Planning de la semaine</h2>
          </div>
        </ng-template>
        <full-calendar [options]="calendarOptions"></full-calendar>
      </p-card>

      <!-- Patients du jour -->
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2><i class="pi pi-users"></i> Patients du jour</h2>
          </div>
        </ng-template>

        @for (apt of todayAppointments; track apt.id) {
          <div class="patient-row">
            <div class="patient-time">{{ apt.heureDebut }}</div>
            <div class="patient-info">
              <strong>{{ apt.patientPrenom }} {{ apt.patientNom }}</strong>
              <small>{{ motifLabel(apt.motif) }}</small>
            </div>
            <p-tag
              [value]="statutLabel(apt.statut)"
              [severity]="statutSeverity(apt.statut)"></p-tag>
          </div>
        } @empty {
          <p class="empty-state">Aucun rendez-vous aujourd'hui</p>
        }
      </p-card>
    </div>

    <!-- Dialog urgence (placeholder) -->
    <p-dialog
      header="Ajouter une urgence"
      [(visible)]="showUrgenceDialog"
      [modal]="true"
      [style]="{width: '500px'}">
      <p>Saisir une urgence ouvrira le formulaire de création de RDV en mode urgence.</p>
      <p>Ce flux est intégré au module Planning. Cliquez ci-dessous pour y accéder.</p>
      <ng-template pTemplate="footer">
        <p-button label="Fermer" styleClass="p-button-secondary p-button-text" (onClick)="showUrgenceDialog = false"></p-button>
        <p-button label="Aller au planning" icon="pi pi-arrow-right" routerLink="/medecin/planning" (onClick)="showUrgenceDialog = false"></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      h1 { margin: 0; font-size: 1.5rem; }
      .date-fr { color: var(--gray-500); font-size: 0.95rem; text-transform: capitalize; margin-top: 0.25rem; }
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
    }
    .kpi { display: flex; align-items: center; gap: 1rem; }
    .kpi i { font-size: 2rem; }
    .kpi-icon-blue { color: #3B82F6; }
    .kpi-icon-orange { color: #F59E0B; }
    .kpi-icon-green { color: #10B981; }
    .kpi-icon-purple { color: #8B5CF6; }
    .kpi-value { font-size: 1.75rem; font-weight: 700; line-height: 1; }
    .kpi-label { color: var(--gray-500); font-size: 0.875rem; margin-top: 0.25rem; }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      @media (max-width: 1200px) { grid-template-columns: 1fr; }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem 0;
      h2 { margin: 0; font-size: 1.125rem; display: flex; align-items: center; gap: 0.5rem; }
    }

    :host ::ng-deep .calendar-card .p-card-body { padding: 0.75rem 1rem 1rem; }
    :host ::ng-deep .fc { font-family: inherit; }
    :host ::ng-deep .fc .fc-toolbar-title { font-size: 1rem; text-transform: capitalize; }
    :host ::ng-deep .fc .fc-button-primary {
      background: var(--primary);
      border-color: var(--primary);
    }

    .patient-row {
      display: grid;
      grid-template-columns: 60px 1fr auto;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--gray-100);
      &:last-child { border-bottom: none; }
    }
    .patient-time { font-weight: 600; color: var(--primary); }
    .patient-info strong { display: block; }
    .patient-info small { color: var(--gray-500); }

    .empty-state { text-align: center; padding: 2rem; color: var(--gray-500); }
  `]
})
export class MedecinDashboardComponent implements OnInit {
  userName = '';
  todayFrench = '';
  todayAppointments: Appointment[] = [];
  pendingCount = 0;
  confirmedCount = 0;
  uniquePatientsToday = 0;
  showUrgenceDialog = false;

  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: frLocale,
    firstDay: 1,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    height: 600,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    events: []
  };

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {
    const user = this.authService.user();
    this.userName = user ? user.nom : '';

    const formatter = new Intl.DateTimeFormat('fr-MA', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    this.todayFrench = formatter.format(new Date());
  }

  ngOnInit(): void {
    this.loadTodayAppointments();
    this.loadWeekAppointments();
  }

  loadTodayAppointments(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    this.appointmentService.getMedecinAppointmentsByDate(todayStr).subscribe({
      next: (data) => {
        this.todayAppointments = data.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
        this.pendingCount = data.filter(a => a.statut === 'EN_ATTENTE').length;
        this.confirmedCount = data.filter(a => a.statut === 'CONFIRME').length;
        this.uniquePatientsToday = new Set(data.map(a => a.patientId)).size;
      }
    });
  }

  loadWeekAppointments(): void {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const start = monday.toISOString().split('T')[0];
    const end = sunday.toISOString().split('T')[0];

    this.appointmentService.getMedecinAppointmentsByRange(start, end).subscribe({
      next: (data) => {
        const events: EventInput[] = data.map(apt => ({
          id: String(apt.id),
          title: `${apt.patientPrenom} ${apt.patientNom}`,
          start: `${apt.date}T${apt.heureDebut}`,
          end: `${apt.date}T${apt.heureFin}`,
          backgroundColor: this.eventColor(apt),
          borderColor: this.eventColor(apt)
        }));
        this.calendarOptions = { ...this.calendarOptions, events };
      }
    });
  }

  eventColor(apt: Appointment): string {
    if (apt.motif === 'URGENCE') return '#EF4444';
    if (apt.motif === 'SUIVI') return '#F59E0B';
    return '#3B82F6';
  }

  motifLabel(m: string): string {
    const map: Record<string, string> = {
      CONSULTATION_GENERALE: 'Consultation générale',
      SUIVI: 'Suivi',
      URGENCE: 'Urgence',
      VACCINATION: 'Vaccination',
      CERTIFICAT_MEDICAL: 'Certificat médical',
      RENOUVELLEMENT_ORDONNANCE: 'Renouvellement',
      AUTRE: 'Autre'
    };
    return map[m] ?? m;
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'En attente',
      CONFIRME: 'Confirmé',
      ANNULE: 'Annulé',
      TERMINE: 'Terminé',
      NO_SHOW: 'Absent'
    };
    return map[s] ?? s;
  }

  statutSeverity(s: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (s) {
      case 'CONFIRME': return 'success';
      case 'EN_ATTENTE': return 'warning';
      case 'ANNULE':
      case 'NO_SHOW': return 'danger';
      default: return 'info';
    }
  }
}
