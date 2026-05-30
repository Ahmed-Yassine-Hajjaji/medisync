import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Invoice } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-secretaire-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="dash-header">
        <h1>Bonjour, {{ prenom }}</h1>
        <p>{{ today | date:'EEEE d MMMM y' }}</p>
      </header>

      <!-- KPI Row -->
      <div class="kpi-row">
        <div class="kpi-card kpi-blue">
          <span class="kpi-value">{{ todayAppointments.length }}</span>
          <span class="kpi-label">RDV aujourd'hui</span>
        </div>
        <div class="kpi-card kpi-orange">
          <span class="kpi-value">{{ pendingCount }}</span>
          <span class="kpi-label">En attente de confirmation</span>
        </div>
        <div class="kpi-card kpi-green">
          <span class="kpi-value">{{ patientsCount }}</span>
          <span class="kpi-label">Patients enregistrés</span>
        </div>
        <div class="kpi-card kpi-red">
          <span class="kpi-value">{{ unpaidTotal | number:'1.0-0' }} DH</span>
          <span class="kpi-label">Factures impayées</span>
        </div>
      </div>

      <!-- Main 2 columns -->
      <div class="main-grid">
        <!-- Left: Timeline -->
        <section class="panel timeline-panel">
          <div class="panel-head">
            <h2>RDV du jour</h2>
            <span class="count-pill">{{ todayAppointments.length }}</span>
          </div>

          @if (todayAppointments.length > 0) {
            <div class="timeline">
              @for (apt of todayAppointments; track apt.id) {
                <div class="tl-item">
                  <div class="tl-time">{{ apt.heureDebut }}</div>
                  <div class="tl-avatar">{{ initials(apt.patientPrenom, apt.patientNom) }}</div>
                  <div class="tl-info">
                    <strong>{{ apt.patientPrenom }} {{ apt.patientNom }}</strong>
                    <span class="tl-sub">Dr. {{ apt.medecinPrenom }} {{ apt.medecinNom }} · {{ formatMotif(apt.motif) }}</span>
                  </div>
                  <span class="badge" [class]="'badge-' + getStatusClass(apt.statut)">{{ getStatusLabel(apt.statut) }}</span>
                  @if (apt.statut === 'EN_ATTENTE') {
                    <div class="tl-actions">
                      <button class="btn-action btn-confirm" (click)="confirm(apt)">Confirmer</button>
                      <button class="btn-action btn-cancel" (click)="cancel(apt)">Annuler</button>
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="empty">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
              </svg>
              <h3>Aucun RDV aujourd'hui</h3>
              <button class="btn-primary" routerLink="/secretaire/appointments">+ Créer un RDV</button>
            </div>
          }
        </section>

        <!-- Right: Quick actions -->
        <aside class="panel actions-panel">
          <h2>Actions rapides</h2>
          <button class="qa qa-blue" routerLink="/secretaire/appointments">+ Nouveau RDV</button>
          <button class="qa qa-green" routerLink="/secretaire/patients">+ Nouveau patient</button>
          <button class="qa qa-gray" routerLink="/secretaire/appointments">Voir tous les RDV</button>

          <div class="mini-section">
            <h3>Factures impayées</h3>
            @for (inv of unpaidInvoices; track inv.id) {
              <div class="inv-row">
                <div class="inv-info">
                  <strong>{{ inv.patientNom }}</strong>
                  <span>{{ (inv.montantTotal - inv.montantPaye) | number:'1.0-0' }} DH</span>
                </div>
                <button class="btn-pay" routerLink="/secretaire/billing">Régler</button>
              </div>
            } @empty {
              <p class="mini-empty">Aucune facture impayée</p>
            }
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 1.5rem; padding: 1.5rem; }
    .dash-header h1 { margin: 0 0 0.25rem; font-size: 1.6rem; font-weight: 700; color: var(--gray-900); }
    .dash-header p { margin: 0; color: var(--gray-500); text-transform: capitalize; }

    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    @media (max-width: 900px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
    .kpi-card {
      border-radius: 12px; padding: 1.25rem;
      display: flex; flex-direction: column; gap: 0.35rem;
      color: #fff;
    }
    .kpi-value { font-size: 1.75rem; font-weight: 700; line-height: 1; }
    .kpi-label { font-size: 0.8rem; opacity: 0.95; }
    .kpi-blue   { background: linear-gradient(135deg, #1E6FD9, #1550A8); }
    .kpi-orange { background: linear-gradient(135deg, #F59E0B, #D97706); }
    .kpi-green  { background: linear-gradient(135deg, #10B981, #059669); }
    .kpi-red    { background: linear-gradient(135deg, #EF4444, #DC2626); }

    .main-grid { display: grid; grid-template-columns: 6fr 4fr; gap: 1.5rem; }
    @media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } }

    .panel { background: #fff; border: 1px solid var(--gray-200); border-radius: 12px; padding: 1.25rem; }
    .panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .panel h2 { margin: 0 0 1rem; font-size: 1.05rem; font-weight: 600; color: var(--gray-800); }
    .panel-head h2 { margin: 0; }
    .count-pill { background: var(--primary-light, #EAF2FD); color: var(--primary, #1E6FD9); font-size: 0.8rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 999px; }

    .timeline { display: flex; flex-direction: column; }
    .tl-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 0; border-bottom: 1px solid var(--gray-100);
    }
    .tl-item:last-child { border-bottom: none; }
    .tl-time { font-weight: 700; color: var(--gray-700); min-width: 48px; font-size: 0.9rem; }
    .tl-avatar {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      background: var(--primary, #1E6FD9); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 600;
    }
    .tl-info { flex: 1; min-width: 0; }
    .tl-info strong { display: block; font-size: 0.9rem; color: var(--gray-900); }
    .tl-sub { font-size: 0.78rem; color: var(--gray-500); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
    .tl-actions { display: flex; gap: 0.4rem; }

    .badge { padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
    .badge-success { background: #DCFCE7; color: #16A34A; }
    .badge-warning { background: #FEF3C7; color: #D97706; }
    .badge-danger  { background: #FEE2E2; color: #DC2626; }
    .badge-info    { background: #EAF2FD; color: #1E6FD9; }

    .btn-action { border: none; border-radius: 8px; padding: 0.4rem 0.7rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn-confirm { background: #10B981; color: #fff; }
    .btn-confirm:hover { background: #059669; }
    .btn-cancel { background: #FEE2E2; color: #DC2626; }
    .btn-cancel:hover { background: #FECACA; }

    .empty { text-align: center; padding: 2.5rem 1rem; color: var(--gray-500); }
    .empty svg { color: var(--gray-300); margin-bottom: 0.75rem; }
    .empty h3 { margin: 0 0 1rem; font-size: 1rem; color: var(--gray-700); }

    .btn-primary { background: var(--primary, #1E6FD9); color: #fff; border: none; border-radius: 8px; padding: 0.6rem 1rem; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn-primary:hover { background: #1550A8; }

    .actions-panel { display: flex; flex-direction: column; }
    .qa { width: 100%; border: none; border-radius: 10px; padding: 0.85rem 1rem; font-size: 0.95rem; font-weight: 600; cursor: pointer; font-family: inherit; margin-bottom: 0.65rem; text-align: left; color: #fff; }
    .qa-blue  { background: #1E6FD9; } .qa-blue:hover  { background: #1550A8; }
    .qa-green { background: #10B981; } .qa-green:hover { background: #059669; }
    .qa-gray  { background: #6B7280; } .qa-gray:hover  { background: #4B5563; }

    .mini-section { margin-top: 1rem; border-top: 1px solid var(--gray-100); padding-top: 1rem; }
    .mini-section h3 { margin: 0 0 0.75rem; font-size: 0.85rem; font-weight: 600; color: var(--gray-700); }
    .inv-row { display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0; border-bottom: 1px solid var(--gray-100); }
    .inv-row:last-child { border-bottom: none; }
    .inv-info strong { display: block; font-size: 0.85rem; color: var(--gray-900); }
    .inv-info span { font-size: 0.8rem; color: #DC2626; font-weight: 600; }
    .btn-pay { background: #EAF2FD; color: #1E6FD9; border: none; border-radius: 8px; padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn-pay:hover { background: #d6e6fb; }
    .mini-empty { font-size: 0.82rem; color: var(--gray-400); text-align: center; padding: 0.5rem 0; }
  `]
})
export class SecretaireDashboardComponent implements OnInit {
  prenom = '';
  today = new Date();

  todayAppointments: Appointment[] = [];
  pendingCount = 0;
  patientsCount = 0;
  unpaidInvoices: Invoice[] = [];
  unpaidTotal = 0;

  constructor(
    private patientService: PatientService,
    private medecinService: MedecinService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    this.prenom = user?.prenom ?? '';
    this.loadAppointments();
    this.loadPatients();
    this.loadInvoices();
  }

  loadAppointments(): void {
    const date = this.toIso(this.today);
    this.appointmentService.getAllAppointmentsByDate(date).subscribe({
      next: (data) => {
        this.todayAppointments = data.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
        this.pendingCount = data.filter(a => a.statut === 'EN_ATTENTE').length;
      }
    });
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe({
      next: (data) => this.patientsCount = data.length
    });
  }

  loadInvoices(): void {
    this.patientService.getAllInvoicesBySecretaire().subscribe({
      next: (data) => {
        const unpaid = data.filter(i => i.statut === 'IMPAYE' || i.statut === 'EN_ATTENTE' || i.statut === 'PARTIEL');
        this.unpaidTotal = unpaid.reduce((sum, i) => sum + (i.montantTotal - i.montantPaye), 0);
        this.unpaidInvoices = unpaid.slice(0, 3);
      }
    });
  }

  confirm(apt: Appointment): void {
    this.appointmentService.confirmSecretaireAppointment(apt.id).subscribe({
      next: () => { apt.statut = 'CONFIRME'; this.pendingCount = Math.max(0, this.pendingCount - 1); }
    });
  }

  cancel(apt: Appointment): void {
    this.appointmentService.cancelSecretaireAppointment(apt.id).subscribe({
      next: () => { apt.statut = 'ANNULE'; this.pendingCount = Math.max(0, this.pendingCount - 1); }
    });
  }

  initials(prenom: string, nom: string): string {
    return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
  }

  private toIso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatMotif(motif: string): string {
    const labels: Record<string, string> = {
      'CONSULTATION_GENERALE': 'Consultation générale',
      'SUIVI': 'Suivi',
      'URGENCE': 'Urgence',
      'VACCINATION': 'Vaccination',
      'CERTIFICAT_MEDICAL': 'Certificat médical',
      'RENOUVELLEMENT_ORDONNANCE': 'Renouvellement ordonnance'
    };
    return labels[motif] || motif;
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
    const labels: Record<string, string> = {
      'CONFIRME': 'Confirmé',
      'EN_ATTENTE': 'En attente',
      'ANNULE': 'Annulé',
      'TERMINE': 'Terminé',
      'NO_SHOW': 'Absent'
    };
    return labels[statut] || statut;
  }
}
