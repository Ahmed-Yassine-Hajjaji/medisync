import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LucideDynamicIcon, LucideCheck, LucideX, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment, StatutAppointment } from '../../../core/models/appointment.model';
import { SpecialiteLabelPipe } from '../../../shared/pipes/specialite-label.pipe';

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 08:00 → 18:00 (inclusive)

interface TimedAppt extends Appointment {
  topPx: number;
  heightPx: number;
}

@Component({
  selector: 'app-secretaire-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, LucideDynamicIcon, SpecialiteLabelPipe],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="agenda-page">
      <header class="page-header">
        <div>
          <h1>RDV du jour</h1>
          <p class="text-muted">Timeline des consultations programmées de 08h à 18h.</p>
        </div>

        <div class="date-nav">
          <button class="icon-btn" (click)="shiftDay(-1)" aria-label="Jour précédent">
            <svg [lucideIcon]="iconLeft" [size]="18"></svg>
          </button>
          <input type="date" class="form-control date-picker" [(ngModel)]="selectedDate" (change)="load()">
          <button class="icon-btn" (click)="shiftDay(1)" aria-label="Jour suivant">
            <svg [lucideIcon]="iconRight" [size]="18"></svg>
          </button>
          <button class="btn btn-secondary btn-sm" (click)="goToday()">Aujourd'hui</button>
        </div>
      </header>

      <!-- KPI rapide -->
      <div class="quick-stats">
        <div class="stat">
          <span class="stat-value">{{ appointments.length }}</span>
          <span class="stat-label">Total RDV</span>
        </div>
        <div class="stat">
          <span class="stat-value confirme">{{ countByStatus('CONFIRME') }}</span>
          <span class="stat-label">Confirmés</span>
        </div>
        <div class="stat">
          <span class="stat-value en-attente">{{ countByStatus('EN_ATTENTE') }}</span>
          <span class="stat-label">En attente</span>
        </div>
        <div class="stat">
          <span class="stat-value annule">{{ countByStatus('ANNULE') }}</span>
          <span class="stat-label">Annulés</span>
        </div>
      </div>

      <!-- Timeline -->
      <div class="card timeline-card">
        @if (loading) {
          <div class="loading-block">
            <div class="spinner"></div>
            <p class="text-muted">Chargement…</p>
          </div>
        } @else if (appointments.length === 0) {
          <div class="empty-state">
            <p>Aucun rendez-vous pour cette date.</p>
          </div>
        } @else {
          <div class="timeline">
            <!-- Colonne heures -->
            <div class="hours-col">
              @for (h of hours; track h) {
                <div class="hour-row">{{ h | number:'2.0' }}:00</div>
              }
            </div>

            <!-- Colonne événements -->
            <div class="events-col">
              @for (h of hours; track h) {
                <div class="grid-line"></div>
              }
              @for (a of timedAppts; track a.id) {
                <div class="event"
                     [class.confirme]="a.statut === 'CONFIRME'"
                     [class.en-attente]="a.statut === 'EN_ATTENTE'"
                     [class.annule]="a.statut === 'ANNULE' || a.statut === 'NO_SHOW'"
                     [class.termine]="a.statut === 'TERMINE'"
                     [style.top.px]="a.topPx"
                     [style.height.px]="a.heightPx">
                  <div class="event-time">{{ a.heureDebut }} – {{ a.heureFin }}</div>
                  <div class="event-patient">{{ a.patientPrenom }} {{ a.patientNom }}</div>
                  <div class="event-medecin text-muted">Dr. {{ a.medecinPrenom }} {{ a.medecinNom }} · {{ a.medecinSpecialite | specialiteLabel }}</div>
                  <div class="event-actions">
                    @if (a.statut === 'EN_ATTENTE') {
                      <button class="mini-btn ok" (click)="confirm(a)" title="Confirmer">
                        <svg [lucideIcon]="iconCheck" [size]="13"></svg>
                      </button>
                    }
                    @if (a.statut !== 'ANNULE' && a.statut !== 'TERMINE') {
                      <button class="mini-btn ko" (click)="cancel(a)" title="Annuler">
                        <svg [lucideIcon]="iconX" [size]="13"></svg>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Légende -->
      <div class="legend">
        <span class="dot confirme"></span> Confirmé
        <span class="dot en-attente"></span> En attente
        <span class="dot annule"></span> Annulé / no-show
        <span class="dot termine"></span> Terminé
      </div>
    </div>
  `,
  styles: [`
    .agenda-page { display: flex; flex-direction: column; gap: 1rem; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 1rem;
    }
    .page-header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }

    .date-nav {
      display: flex; align-items: center; gap: 0.5rem;
      background: #fff;
      padding: 0.4rem;
      border-radius: 10px;
      border: 1px solid var(--gray-100);
    }
    .date-picker { width: 160px; padding: 6px 10px; font-size: 0.9rem; }
    .icon-btn {
      width: 34px; height: 34px;
      border: 1px solid var(--gray-200);
      background: #fff; border-radius: 8px;
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--gray-600); cursor: pointer;
    }
    .icon-btn:hover { color: var(--primary); border-color: var(--primary); }

    .quick-stats {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;
    }
    @media (max-width: 640px) { .quick-stats { grid-template-columns: repeat(2, 1fr); } }
    .stat {
      background: #fff;
      padding: 0.9rem 1rem;
      border-radius: 10px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      display: flex; flex-direction: column;
    }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--gray-800); }
    .stat-value.confirme    { color: #047857; }
    .stat-value.en-attente  { color: #B45309; }
    .stat-value.annule      { color: #B91C1C; }
    .stat-label { color: var(--gray-500); font-size: 0.85rem; }

    .timeline-card { padding: 1rem; }
    .loading-block { padding: 3rem; text-align: center; }
    .empty-state { padding: 3rem; text-align: center; color: var(--gray-500); }
    .spinner {
      width: 28px; height: 28px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      margin: 0 auto 0.75rem;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .timeline {
      display: grid;
      grid-template-columns: 70px 1fr;
      position: relative;
    }
    .hours-col {
      display: flex; flex-direction: column;
    }
    .hour-row {
      height: 64px;
      color: var(--gray-500); font-size: 0.75rem;
      padding-top: 0.1rem;
      border-top: 1px solid var(--gray-100);
    }
    .hour-row:first-child { border-top: none; }

    .events-col {
      position: relative;
      min-height: 704px; /* 11 * 64 */
    }
    .grid-line { height: 64px; border-top: 1px dashed var(--gray-100); }
    .grid-line:first-child { border-top: none; }

    .event {
      position: absolute; left: 0.5rem; right: 0.5rem;
      background: #fff;
      border-left: 4px solid var(--primary);
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      font-size: 0.8rem;
      overflow: hidden;
    }
    .event.confirme   { background: #ECFDF5; border-left-color: #047857; }
    .event.en-attente { background: #FEF3C7; border-left-color: #B45309; }
    .event.annule     { background: #FEE2E2; border-left-color: #B91C1C; opacity: 0.7; }
    .event.termine    { background: #EFF6FF; border-left-color: #1E6FD9; }

    .event-time { font-weight: 600; font-size: 0.75rem; color: var(--gray-700); }
    .event-patient { font-weight: 600; color: var(--gray-900); margin-top: 0.1rem; }
    .event-medecin { font-size: 0.72rem; }

    .event-actions {
      position: absolute; top: 0.35rem; right: 0.4rem;
      display: flex; gap: 0.2rem;
    }
    .mini-btn {
      width: 22px; height: 22px;
      border-radius: 6px; border: none;
      cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .mini-btn.ok { background: #047857; color: #fff; }
    .mini-btn.ok:hover { background: #065F46; }
    .mini-btn.ko { background: #B91C1C; color: #fff; }
    .mini-btn.ko:hover { background: #991B1B; }

    .legend {
      display: flex; gap: 1rem; padding-left: 0.25rem;
      color: var(--gray-600); font-size: 0.78rem;
    }
    .dot {
      display: inline-block; width: 10px; height: 10px;
      border-radius: 50%; margin-right: 0.25rem;
    }
    .dot.confirme   { background: #047857; }
    .dot.en-attente { background: #B45309; }
    .dot.annule     { background: #B91C1C; }
    .dot.termine    { background: #1E6FD9; }

    .btn-sm { padding: 6px 12px; font-size: 0.85rem; }
  `]
})
export class SecretaireAgendaComponent implements OnInit {
  hours = HOURS;
  selectedDate: string;
  appointments: Appointment[] = [];
  timedAppts: TimedAppt[] = [];
  loading = false;

  readonly iconCheck = LucideCheck.icon;
  readonly iconX     = LucideX.icon;
  readonly iconLeft  = LucideChevronLeft.icon;
  readonly iconRight = LucideChevronRight.icon;

  constructor(
    private appointmentService: AppointmentService,
    private toast: MessageService,
  ) {
    this.selectedDate = new Date().toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    this.load();
  }

  // ---------- Navigation ----------

  shiftDay(delta: number): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + delta);
    this.selectedDate = d.toISOString().slice(0, 10);
    this.load();
  }

  goToday(): void {
    this.selectedDate = new Date().toISOString().slice(0, 10);
    this.load();
  }

  // ---------- Chargement ----------

  load(): void {
    this.loading = true;
    this.appointmentService.getAllAppointmentsByDate(this.selectedDate).subscribe({
      next: (data) => {
        this.appointments = data;
        this.layout();
        this.loading = false;
      },
      error: () => {
        this.appointments = [];
        this.timedAppts = [];
        this.loading = false;
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les rendez-vous.' });
      }
    });
  }

  private layout(): void {
    // 1 heure = 64px, ancrée à 8h
    const baseHour = 8;
    const pxPerHour = 64;
    this.timedAppts = this.appointments.map(a => {
      const [hs, ms] = (a.heureDebut ?? '08:00').split(':').map(Number);
      const [he, me] = (a.heureFin   ?? '08:30').split(':').map(Number);
      const startMin = (hs - baseHour) * 60 + ms;
      const endMin   = (he - baseHour) * 60 + me;
      const top = (startMin / 60) * pxPerHour;
      const height = Math.max(36, ((endMin - startMin) / 60) * pxPerHour - 4);
      return { ...a, topPx: top, heightPx: height };
    });
  }

  // ---------- Actions ----------

  countByStatus(s: StatutAppointment): number {
    return this.appointments.filter(a => a.statut === s).length;
  }

  confirm(a: Appointment): void {
    this.appointmentService.confirmSecretaireAppointment(a.id).subscribe({
      next: () => {
        a.statut = 'CONFIRME';
        this.toast.add({ severity: 'success', summary: 'Confirmé', detail: `RDV de ${a.patientPrenom} ${a.patientNom} confirmé.` });
      }
    });
  }

  cancel(a: Appointment): void {
    if (!confirm(`Annuler le rendez-vous de ${a.patientPrenom} ${a.patientNom} ?`)) return;
    this.appointmentService.cancelSecretaireAppointment(a.id).subscribe({
      next: () => {
        a.statut = 'ANNULE';
        this.toast.add({ severity: 'info', summary: 'Annulé', detail: 'Le rendez-vous a été annulé.' });
      }
    });
  }
}
