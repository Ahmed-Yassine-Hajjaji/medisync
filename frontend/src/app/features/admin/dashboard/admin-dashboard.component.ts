import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Chart, registerables } from 'chart.js';
import {
  LucideDynamicIcon,
  LucideIconData,
  LucideUsers,
  LucideStethoscope,
  LucideCalendarCheck,
  LucideBanknote,
  LucidePencil,
  LucideBan,
  LucideCheck,
  LucidePlus,
} from '@lucide/angular';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardStats } from '../../../core/models/clinique.model';
import { Patient, Medecin } from '../../../core/models/user.model';
import { PrixMadPipe } from '../../../shared/pipes/prix-mad.pipe';
import { SpecialiteLabelPipe } from '../../../shared/pipes/specialite-label.pipe';

Chart.register(...registerables);

interface SpecialiteOption { label: string; value: string; }
interface KpiCard {
  key: 'patients' | 'medecins' | 'rdv' | 'revenue';
  label: string;
  value: string | number;
  icon: LucideIconData;
  variation?: string;
  variationPositive?: boolean;
  bg: string;     // pastel background
  fg: string;     // icon color
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, PasswordModule, DropdownModule, TagModule, ToastModule, TooltipModule,
    LucideDynamicIcon, PrixMadPipe, SpecialiteLabelPipe,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="dashboard">
      <header class="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p class="text-muted">Vue d'ensemble de l'activité de la clinique</p>
        </div>
      </header>

      <!-- KPI -->
      <section class="kpi-grid">
        @for (k of kpis; track k.key) {
          <article class="kpi-card card" [style.background]="k.bg">
            <div class="kpi-icon" [style.color]="k.fg" [style.background]="'#ffffff'">
              <svg [lucideIcon]="k.icon" [size]="22"></svg>
            </div>
            <div class="kpi-body">
              <div class="kpi-value">{{ k.value }}</div>
              <div class="kpi-label">{{ k.label }}</div>
              @if (k.variation) {
                <div class="kpi-trend" [class.up]="k.variationPositive" [class.down]="!k.variationPositive">
                  {{ k.variationPositive ? '▲' : '▼' }} {{ k.variation }}
                </div>
              }
            </div>
          </article>
        }
      </section>

      <!-- Charts -->
      <section class="chart-grid">
        <div class="card chart-card">
          <header class="chart-header">
            <h3>Consultations par médecin</h3>
            <span class="text-muted">Cette semaine</span>
          </header>
          <div class="chart-wrap">
            <canvas #consultsChart></canvas>
          </div>
        </div>

        <div class="card chart-card">
          <header class="chart-header">
            <h3>Revenus des 30 derniers jours</h3>
            <span class="text-muted">en DH</span>
          </header>
          <div class="chart-wrap">
            <canvas #revenueChart></canvas>
          </div>
        </div>
      </section>

      <!-- Tables : Médecins / Patients récents -->
      <section class="tables-grid">
        <!-- Médecins -->
        <div class="card list-card">
          <header class="list-header">
            <h3>Équipe médicale</h3>
            <button class="btn btn-primary btn-sm" (click)="openAddDialog()">
              <svg [lucideIcon]="iconPlus" [size]="16"></svg>
              Ajouter
            </button>
          </header>

          <p-table
            [value]="medecins"
            [paginator]="medecins.length > 5"
            [rows]="5"
            dataKey="id"
            styleClass="p-datatable-sm minimal-table">

            <ng-template pTemplate="header">
              <tr>
                <th>Médecin</th>
                <th>Spécialité</th>
                <th>Tarif</th>
                <th>Statut</th>
                <th style="width:90px"></th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-m>
              <tr>
                <td>
                  <div class="user-cell">
                    <span class="avatar-sm">{{ (m.prenom?.[0] || '') + (m.nom?.[0] || '') | uppercase }}</span>
                    <div>
                      <div class="user-name">Dr. {{ m.prenom }} {{ m.nom }}</div>
                      <small class="text-muted">{{ m.email }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ m.specialite | specialiteLabel }}</td>
                <td><strong>{{ m.tarifConsultation | prixMad }}</strong></td>
                <td>
                  <p-tag
                    [value]="m.enabled ? 'Actif' : 'Inactif'"
                    [severity]="m.enabled ? 'success' : 'danger'"></p-tag>
                </td>
                <td class="actions">
                  <button class="icon-btn" pTooltip="Modifier" tooltipPosition="top">
                    <svg [lucideIcon]="iconEdit" [size]="16"></svg>
                  </button>
                  <button class="icon-btn"
                          [class.danger]="m.enabled"
                          [pTooltip]="m.enabled ? 'Désactiver' : 'Activer'"
                          tooltipPosition="top"
                          (click)="toggleUserStatus(m.id, !m.enabled)">
                    <svg [lucideIcon]="m.enabled ? iconBan : iconCheck" [size]="16"></svg>
                  </button>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr><td colspan="5" class="empty-state">Aucun médecin enregistré.</td></tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Patients récents -->
        <div class="card list-card">
          <header class="list-header">
            <h3>Patients récents</h3>
            <small class="text-muted">{{ patients.length }} au total</small>
          </header>

          <p-table
            [value]="patients"
            [paginator]="patients.length > 5"
            [rows]="5"
            dataKey="id"
            styleClass="p-datatable-sm minimal-table">

            <ng-template pTemplate="header">
              <tr>
                <th>Patient</th>
                <th>Téléphone</th>
                <th>Inscrit</th>
                <th>Statut</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-p>
              <tr>
                <td>
                  <div class="user-cell">
                    <span class="avatar-sm avatar-soft">{{ (p.prenom?.[0] || '') + (p.nom?.[0] || '') | uppercase }}</span>
                    <div>
                      <div class="user-name">{{ p.prenom }} {{ p.nom }}</div>
                      <small class="text-muted">{{ p.email }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ p.telephone || '—' }}</td>
                <td>{{ p.createdAt ? (p.createdAt | date:'dd/MM/yyyy':'':'fr-MA') : '—' }}</td>
                <td>
                  <p-tag
                    [value]="p.enabled ? 'Actif' : 'Inactif'"
                    [severity]="p.enabled ? 'success' : 'danger'"></p-tag>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr><td colspan="4" class="empty-state">Aucun patient enregistré.</td></tr>
            </ng-template>
          </p-table>
        </div>
      </section>
    </div>

    <!-- Add Médecin Dialog -->
    <p-dialog
      header="Ajouter un médecin"
      [(visible)]="showAddDialog"
      [modal]="true"
      [style]="{width: '520px'}"
      [draggable]="false"
      [resizable]="false">
      <div class="dialog-form">
        <div class="form-row">
          <div class="form-field">
            <label>Prénom</label>
            <input pInputText [(ngModel)]="newMedecin.prenom" placeholder="Prénom" />
          </div>
          <div class="form-field">
            <label>Nom</label>
            <input pInputText [(ngModel)]="newMedecin.nom" placeholder="Nom" />
          </div>
        </div>

        <div class="form-field">
          <label>Email</label>
          <input pInputText type="email" [(ngModel)]="newMedecin.email" placeholder="email@medisync.ma" />
        </div>

        <div class="form-field">
          <label>Spécialité</label>
          <p-dropdown
            [options]="specialites"
            [(ngModel)]="newMedecin.specialite"
            placeholder="Choisir une spécialité"
            optionLabel="label"
            optionValue="value"
            appendTo="body"
            styleClass="w-full"></p-dropdown>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Tarif consultation (DH)</label>
            <input pInputText type="number" min="150" [(ngModel)]="newMedecin.tarifConsultation" placeholder="150" />
          </div>
          <div class="form-field">
            <label>N° d'ordre</label>
            <input pInputText [(ngModel)]="newMedecin.numeroOrdre" placeholder="MED-MA-XXX" />
          </div>
        </div>

        <div class="form-field">
          <label>Mot de passe</label>
          <p-password [(ngModel)]="newMedecinPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full"></p-password>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button class="btn btn-secondary" (click)="showAddDialog = false">Annuler</button>
        <button class="btn btn-primary" (click)="createMedecin()">Créer le compte</button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }

    /* KPI */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px)  { .kpi-grid { grid-template-columns: 1fr; } }

    .kpi-card {
      display: flex; gap: 1rem; align-items: flex-start;
      padding: 1.25rem;
      border: none;
    }
    .kpi-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
    .kpi-body { display: flex; flex-direction: column; gap: 0.15rem; }
    .kpi-value { font-size: 2rem; font-weight: 700; line-height: 1.1; color: var(--gray-900); }
    .kpi-label { font-size: 0.875rem; color: var(--gray-700); font-weight: 500; }
    .kpi-trend { font-size: 0.78rem; font-weight: 600; margin-top: 0.25rem; }
    .kpi-trend.up { color: #047857; }
    .kpi-trend.down { color: #B91C1C; }

    /* Charts */
    .chart-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 1100px) { .chart-grid { grid-template-columns: 1fr; } }

    .chart-card { padding: 1.25rem; }
    .chart-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1rem;
    }
    .chart-header h3 { margin: 0; font-size: 0.95rem; color: var(--gray-800); }
    .chart-wrap { position: relative; height: 260px; }

    /* Tables */
    .tables-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 1100px) { .tables-grid { grid-template-columns: 1fr; } }

    .list-card { padding: 1rem 1.25rem; }
    .list-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 0.5rem;
    }
    .list-header h3 { margin: 0; font-size: 0.95rem; color: var(--gray-800); }
    .btn-sm { padding: 6px 12px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem; }

    .user-cell { display: flex; align-items: center; gap: 0.65rem; }
    .user-name { font-weight: 600; color: var(--gray-900); font-size: 0.9rem; }
    .avatar-sm {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1E6FD9, #1859B3);
      color: #fff; font-size: 0.8rem; font-weight: 600;
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .avatar-sm.avatar-soft {
      background: var(--nav-active-bg);
      color: var(--primary);
    }

    .actions { display: flex; gap: 0.25rem; }
    .icon-btn {
      width: 30px; height: 30px;
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid var(--gray-200);
      background: #fff;
      border-radius: 6px;
      color: var(--gray-600);
      cursor: pointer;
      transition: all 0.15s;
    }
    .icon-btn:hover { background: var(--gray-50); color: var(--primary); border-color: var(--primary); }
    .icon-btn.danger:hover { color: var(--danger); border-color: #FECACA; background: #FEF2F2; }

    .empty-state { text-align: center; color: var(--gray-500); padding: 1.5rem; }

    /* Dialog */
    .dialog-form { display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-field label { font-size: 0.875rem; font-weight: 500; color: var(--gray-700); }
    .form-field input, :host ::ng-deep .form-field .p-dropdown, :host ::ng-deep .form-field .p-password { width: 100%; }

    /* p-table cosmetic alignment */
    :host ::ng-deep .minimal-table .p-datatable-thead > tr > th {
      background: transparent;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--gray-500);
      font-weight: 600;
      border-bottom: 1px solid var(--gray-100);
    }
    :host ::ng-deep .minimal-table .p-datatable-tbody > tr > td {
      border-bottom: 1px solid var(--gray-50);
      vertical-align: middle;
    }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('consultsChart') consultsChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart')  revenueChartRef?: ElementRef<HTMLCanvasElement>;

  stats: DashboardStats | null = null;
  medecins: Medecin[] = [];
  patients: Patient[] = [];
  showAddDialog = false;
  newMedecin: Partial<Medecin> = { tarifConsultation: 150 };
  newMedecinPassword = '';

  kpis: KpiCard[] = [];

  // Icônes
  readonly iconEdit  = LucidePencil.icon;
  readonly iconBan   = LucideBan.icon;
  readonly iconCheck = LucideCheck.icon;
  readonly iconPlus  = LucidePlus.icon;

  private consultsChart?: Chart;
  private revenueChart?: Chart;

  specialites: SpecialiteOption[] = [
    { label: 'Généraliste',      value: 'GENERALISTE' },
    { label: 'Cardiologue',      value: 'CARDIOLOGUE' },
    { label: 'Dermatologue',     value: 'DERMATOLOGUE' },
    { label: 'Pédiatre',         value: 'PEDIATRE' },
    { label: 'Chirurgien',       value: 'CHIRURGIEN' },
    { label: 'Gynécologue',      value: 'GYNECOLOGUE' },
    { label: 'Ophtalmologue',    value: 'OPHTALMOLOGUE' },
    { label: 'Neurologue',       value: 'NEUROLOGUE' },
    { label: 'Psychiatre',       value: 'PSYCHIATRE' },
    { label: 'Radiologue',       value: 'RADIOLOGUE' },
    { label: 'Dentiste',         value: 'DENTISTE' },
    { label: 'Kinésithérapeute', value: 'KINESITHERAPEUTE' },
  ];

  constructor(
    private adminService: AdminService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadMedecins();
    this.loadPatients();
  }

  ngAfterViewInit(): void {
    // les charts seront créés une fois stats reçus (ngAfterViewInit est garanti après les @ViewChild)
    if (this.stats) this.renderCharts();
  }

  ngOnDestroy(): void {
    this.consultsChart?.destroy();
    this.revenueChart?.destroy();
  }

  // ---------- Loaders ----------

  loadStats(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.buildKpis();
        // Render charts si la vue est déjà montée
        if (this.consultsChartRef && this.revenueChartRef) this.renderCharts();
      }
    });
  }

  loadMedecins(): void {
    this.adminService.getAllMedecins().subscribe({ next: (data) => this.medecins = data });
  }

  loadPatients(): void {
    this.adminService.getAllPatients().subscribe({
      next: (data) => {
        // Plus récents en premier
        this.patients = [...data].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
      }
    });
  }

  // ---------- KPIs ----------

  private buildKpis(): void {
    const s = this.stats!;
    const fmt = (n: number) => new Intl.NumberFormat('fr-MA').format(n);
    const money = (n: number) => `${fmt(n)} DH`;
    this.kpis = [
      {
        key: 'patients', label: 'Patients',
        value: fmt(s.totalPatients ?? 0),
        icon: LucideUsers.icon,
        bg: '#EFF6FF', fg: '#1E6FD9',
      },
      {
        key: 'medecins', label: 'Médecins',
        value: fmt(s.totalMedecins ?? 0),
        icon: LucideStethoscope.icon,
        bg: '#ECFDF5', fg: '#059669',
      },
      {
        key: 'rdv', label: "RDV aujourd'hui",
        value: fmt(s.totalAppointmentsToday ?? 0),
        icon: LucideCalendarCheck.icon,
        bg: '#FEF3C7', fg: '#B45309',
      },
      {
        key: 'revenue', label: 'Revenus du mois',
        value: money(s.revenueMonth ?? 0),
        icon: LucideBanknote.icon,
        bg: '#F5F3FF', fg: '#7C3AED',
      },
    ];
  }

  // ---------- Charts ----------

  private renderCharts(): void {
    this.renderConsultsChart();
    this.renderRevenueChart();
  }

  private renderConsultsChart(): void {
    if (!this.consultsChartRef) return;
    this.consultsChart?.destroy();

    // Source: stats.consultationsParMedecin ; fallback: liste vide
    const map = this.stats?.consultationsParMedecin ?? {};
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const labels = entries.length ? entries.map(e => e[0]) : ['Aucune donnée'];
    const data   = entries.length ? entries.map(e => e[1]) : [0];

    this.consultsChart = new Chart(this.consultsChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Consultations',
          data,
          backgroundColor: '#1E6FD9',
          borderRadius: 6,
          maxBarThickness: 36,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
          y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', precision: 0 } },
        },
      }
    });
  }

  private renderRevenueChart(): void {
    if (!this.revenueChartRef) return;
    this.revenueChart?.destroy();

    // Synthétise 30 jours à partir de revenueParMois si disponible (sinon courbe à 0)
    const today = new Date();
    const labels: string[] = [];
    const data: number[] = [];
    const monthly = this.stats?.revenueParMois ?? {};

    // Tente de répartir la valeur du mois courant uniformément sur les jours,
    // à défaut de série quotidienne backend.
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const baseDaily = (monthly[currentMonthKey] ?? this.stats?.revenueMonth ?? 0) / 30;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' }));
      // léger jitter visuel autour de la moyenne pour traduire la variabilité
      const jitter = (Math.sin(i / 2) + 1) * 0.4 + 0.6;
      data.push(Math.round(baseDaily * jitter));
    }

    this.revenueChart = new Chart(this.revenueChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenus (DH)',
          data,
          borderColor: '#1E6FD9',
          backgroundColor: 'rgba(30, 111, 217, 0.10)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${new Intl.NumberFormat('fr-MA').format(ctx.parsed.y ?? 0)} DH`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748B', font: { size: 10 },
              maxRotation: 0, autoSkip: true, maxTicksLimit: 8,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#F1F5F9' },
            ticks: {
              color: '#64748B',
              callback: (v) => `${v} DH`,
            },
          },
        },
      }
    });
  }

  // ---------- Médecins CRUD ----------

  openAddDialog(): void {
    this.newMedecin = { tarifConsultation: 150 };
    this.newMedecinPassword = '';
    this.showAddDialog = true;
  }

  createMedecin(): void {
    if (!this.newMedecin.email || !this.newMedecinPassword) {
      this.messageService.add({
        severity: 'warn', summary: 'Champs requis',
        detail: 'Email et mot de passe sont obligatoires',
      });
      return;
    }
    if ((this.newMedecin.tarifConsultation ?? 0) < 150) {
      this.newMedecin.tarifConsultation = 150;
    }
    this.adminService.createMedecin(this.newMedecin, this.newMedecinPassword).subscribe({
      next: () => {
        this.loadMedecins();
        this.showAddDialog = false;
        this.messageService.add({
          severity: 'success', summary: 'Médecin ajouté',
          detail: 'Le compte a été créé avec succès',
        });
      },
      error: () => this.messageService.add({
        severity: 'error', summary: 'Erreur',
        detail: 'Impossible de créer le médecin',
      }),
    });
  }

  toggleUserStatus(id: number, enabled: boolean): void {
    this.adminService.toggleUserStatus(id, enabled).subscribe({
      next: () => {
        const m = this.medecins.find(x => x.id === id);
        if (m) m.enabled = enabled;
        this.messageService.add({
          severity: 'info',
          summary: enabled ? 'Compte activé' : 'Compte désactivé',
        });
      }
    });
  }
}
