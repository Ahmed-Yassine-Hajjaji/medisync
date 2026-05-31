import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LucideDynamicIcon, LucidePlus, LucideCheck, LucideX, LucideFilter, LucideCalendar } from '@lucide/angular';

import { AppointmentService } from '../../../core/services/appointment.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { PatientService } from '../../../core/services/patient.service';
import { Appointment, AppointmentCreateRequest, Creneau, MotifConsultation, StatutAppointment } from '../../../core/models/appointment.model';
import { Medecin, Patient } from '../../../core/models/user.model';

interface Option<T> { label: string; value: T; }

@Component({
  selector: 'app-secretaire-appointments',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, DialogModule, DropdownModule, AutoCompleteModule, TagModule, ToastModule,
    LucideDynamicIcon
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="page-header">
      <div>
        <h1>Rendez-vous</h1>
        <p class="text-muted">Gérer les RDV de tous les médecins.</p>
      </div>
      <button class="btn-primary" (click)="openCreate()">
        <svg [lucideIcon]="iconPlus" [size]="16"></svg>
        Nouveau RDV
      </button>
    </div>

    <div class="filters-card">
      <div class="filter-item">
        <label>Du</label>
        <input type="date" [(ngModel)]="filterDateFrom" (change)="load()">
      </div>
      <div class="filter-item">
        <label>Au</label>
        <input type="date" [(ngModel)]="filterDateTo" (change)="load()">
      </div>
      <div class="filter-item">
        <label>Médecin</label>
        <p-dropdown [options]="medecinOptions" [(ngModel)]="filterMedecinId" placeholder="Tous"
                    [showClear]="true" (onChange)="applyFilters()" optionLabel="label" optionValue="value"
                    styleClass="w-full"></p-dropdown>
      </div>
      <div class="filter-item">
        <label>Statut</label>
        <p-dropdown [options]="statutOptions" [(ngModel)]="filterStatut" placeholder="Tous"
                    [showClear]="true" (onChange)="applyFilters()" optionLabel="label" optionValue="value"
                    styleClass="w-full"></p-dropdown>
      </div>
    </div>

    <div class="table-card">
      <p-table [value]="filtered" [paginator]="true" [rows]="10" [loading]="loading"
               styleClass="minimal-table" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th>Date</th>
            <th>Heure</th>
            <th>Patient</th>
            <th>Médecin</th>
            <th>Motif</th>
            <th>Statut</th>
            <th style="width: 130px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.date }}</td>
            <td><strong>{{ row.heureDebut }}</strong></td>
            <td>{{ row.patientPrenom }} {{ row.patientNom }}</td>
            <td>Dr. {{ row.medecinPrenom }} {{ row.medecinNom }}<br><small class="text-muted">{{ row.medecinSpecialite }}</small></td>
            <td>{{ motifLabel(row.motif) }}</td>
            <td>
              <p-tag [value]="statutLabel(row.statut)" [severity]="statutSeverity(row.statut)"></p-tag>
            </td>
            <td>
              <div class="row-actions">
                @if (row.statut === 'EN_ATTENTE') {
                  <button class="icon-btn ok" title="Confirmer" (click)="confirm(row)">
                    <svg [lucideIcon]="iconCheck" [size]="14"></svg>
                  </button>
                }
                @if (row.statut !== 'ANNULE' && row.statut !== 'TERMINE') {
                  <button class="icon-btn danger" title="Annuler" (click)="cancel(row)">
                    <svg [lucideIcon]="iconX" [size]="14"></svg>
                  </button>
                }
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="empty-cell">Aucun rendez-vous</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog header="Nouveau rendez-vous" [(visible)]="showCreate" [modal]="true"
              [style]="{ width: '560px' }" [draggable]="false">
      <div class="dialog-form">
        <div class="form-group">
          <label>Patient</label>
          <p-autoComplete [(ngModel)]="selectedPatient" [suggestions]="patientSuggestions"
                          (completeMethod)="searchPatient($event)" field="display"
                          placeholder="Rechercher un patient..." styleClass="w-full"></p-autoComplete>
        </div>
        <div class="form-group">
          <label>Médecin</label>
          <p-dropdown [options]="medecinOptions" [(ngModel)]="newMedecinId"
                      (onChange)="onMedecinOrDateChange()" optionLabel="label" optionValue="value"
                      placeholder="Choisir un médecin" styleClass="w-full"></p-dropdown>
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" [(ngModel)]="newDate" (change)="onMedecinOrDateChange()">
        </div>
        @if (creneaux.length > 0) {
          <div class="form-group">
            <label>Créneau</label>
            <div class="creneaux-grid">
              @for (c of creneaux; track c.heureDebut) {
                <button type="button" class="creneau-btn"
                        [class.active]="newHeureDebut === c.heureDebut"
                        [disabled]="!c.disponible"
                        (click)="newHeureDebut = c.heureDebut">
                  {{ c.heureDebut }}
                </button>
              }
            </div>
          </div>
        }
        <div class="form-group">
          <label>Motif</label>
          <p-dropdown [options]="motifOptions" [(ngModel)]="newMotif" optionLabel="label" optionValue="value"
                      placeholder="Choisir un motif" styleClass="w-full"></p-dropdown>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <textarea [(ngModel)]="newNotes" rows="3" placeholder="Notes optionnelles..."></textarea>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button class="btn-secondary" (click)="showCreate = false">Annuler</button>
        <button class="btn-primary" (click)="create()" [disabled]="!canCreate()">Créer</button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host { display: block; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
    .page-header p { margin: 0.25rem 0 0; }
    .text-muted { color: #64748b; font-size: 0.875rem; }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: #1E6FD9; color: white; border: none; border-radius: 8px;
      padding: 0.625rem 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .btn-primary:hover { background: #1859B3; }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-secondary {
      background: transparent; color: #475569; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 0.5rem 1rem; font-weight: 500; cursor: pointer; margin-right: 0.5rem;
    }
    .btn-secondary:hover { background: #f8fafc; }

    .filters-card {
      background: white; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 1rem 1.25rem; display: grid; grid-template-columns: 180px 180px 1fr 1fr; gap: 1rem; margin-bottom: 1rem;
    }
    .filter-item label { display: block; font-size: 0.75rem; font-weight: 600;
      color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.375rem; }
    .filter-item input[type=date] {
      width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 0.875rem; color: #0f172a;
    }

    .table-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    :host ::ng-deep .minimal-table .p-datatable-thead > tr > th {
      background: #f8fafc; color: #475569; font-weight: 600; font-size: 0.75rem;
      text-transform: uppercase; letter-spacing: 0.04em; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;
    }
    :host ::ng-deep .minimal-table .p-datatable-tbody > tr > td {
      padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem;
    }
    :host ::ng-deep .minimal-table .p-datatable-tbody > tr:hover { background: #f8fafc; }
    .row-actions { display: flex; gap: 0.375rem; }
    .icon-btn {
      width: 28px; height: 28px; border-radius: 6px; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; transition: transform 0.15s;
    }
    .icon-btn:hover { transform: scale(1.08); }
    .icon-btn.ok { background: #ECFDF5; color: #059669; }
    .icon-btn.danger { background: #FEE2E2; color: #DC2626; }
    .empty-cell { text-align: center; padding: 2rem; color: #94a3b8; }

    .dialog-form { padding: 0.5rem 0; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 500; color: #334155; margin-bottom: 0.375rem; font-size: 0.875rem; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 0.875rem; font-family: inherit;
    }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #1E6FD9; }
    .creneaux-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.375rem; }
    .creneau-btn {
      padding: 0.5rem 0.25rem; border: 1px solid #e2e8f0; background: white; border-radius: 6px;
      font-size: 0.8125rem; cursor: pointer; transition: all 0.15s;
    }
    .creneau-btn:hover:not(:disabled) { border-color: #1E6FD9; color: #1E6FD9; }
    .creneau-btn:disabled { background: #f1f5f9; color: #cbd5e1; cursor: not-allowed; }
    .creneau-btn.active { background: #1E6FD9; color: white; border-color: #1E6FD9; }
  `]
})
export class SecretaireAppointmentsComponent implements OnInit {
  iconPlus = LucidePlus.icon;
  iconCheck = LucideCheck.icon;
  iconX = LucideX.icon;

  loading = false;
  all: Appointment[] = [];
  filtered: Appointment[] = [];

  filterDateFrom = this.todayIso();
  filterDateTo = this.todayIso();
  filterMedecinId: number | null = null;
  filterStatut: StatutAppointment | null = null;

  medecins: Medecin[] = [];
  medecinOptions: Option<number>[] = [];

  statutOptions: Option<StatutAppointment>[] = [
    { label: 'En attente', value: 'EN_ATTENTE' },
    { label: 'Confirmé', value: 'CONFIRME' },
    { label: 'Annulé', value: 'ANNULE' },
    { label: 'Terminé', value: 'TERMINE' },
    { label: 'No-show', value: 'NO_SHOW' }
  ];

  motifOptions: Option<MotifConsultation>[] = [
    { label: 'Consultation générale', value: 'CONSULTATION_GENERALE' },
    { label: 'Suivi', value: 'SUIVI' },
    { label: 'Urgence', value: 'URGENCE' },
    { label: 'Vaccination', value: 'VACCINATION' },
    { label: 'Certificat médical', value: 'CERTIFICAT_MEDICAL' },
    { label: 'Renouvellement ordonnance', value: 'RENOUVELLEMENT_ORDONNANCE' },
    { label: 'Autre', value: 'AUTRE' }
  ];

  // Create dialog state
  showCreate = false;
  selectedPatient: any = null;
  patientSuggestions: any[] = [];
  newMedecinId: number | null = null;
  newDate = this.todayIso();
  newHeureDebut = '';
  newMotif: MotifConsultation = 'CONSULTATION_GENERALE';
  newNotes = '';
  creneaux: Creneau[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private medecinService: MedecinService,
    private patientService: PatientService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.medecinService.getAllMedecins().subscribe(list => {
      this.medecins = list;
      this.medecinOptions = list.map(m => ({
        label: `Dr. ${m.prenom} ${m.nom} — ${m.specialite}`,
        value: m.id!
      }));
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    const obs = this.filterDateFrom === this.filterDateTo
      ? this.appointmentService.getAllAppointmentsByDate(this.filterDateFrom)
      : this.appointmentService.getAllAppointmentsBetween(this.filterDateFrom, this.filterDateTo);
    obs.subscribe({
      next: list => {
        this.all = list;
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    this.filtered = this.all.filter(a =>
      (!this.filterMedecinId || a.medecinId === this.filterMedecinId) &&
      (!this.filterStatut || a.statut === this.filterStatut)
    );
  }

  confirm(row: Appointment): void {
    this.appointmentService.confirmSecretaireAppointment(row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Confirmé', detail: 'RDV confirmé' });
        this.load();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec confirmation' })
    });
  }

  cancel(row: Appointment): void {
    this.appointmentService.cancelSecretaireAppointment(row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Annulé', detail: 'RDV annulé' });
        this.load();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec annulation' })
    });
  }

  openCreate(): void {
    this.selectedPatient = null;
    this.newMedecinId = null;
    this.newDate = this.todayIso();
    this.newHeureDebut = '';
    this.newMotif = 'CONSULTATION_GENERALE';
    this.newNotes = '';
    this.creneaux = [];
    this.showCreate = true;
  }

  searchPatient(event: { query: string }): void {
    const q = (event.query || '').trim();
    if (q.length < 2) { this.patientSuggestions = []; return; }
    this.patientService.searchPatients(q).subscribe(list => {
      this.patientSuggestions = list.map(p => ({ ...p, display: `${p.prenom} ${p.nom} — ${p.email}` }));
    });
  }

  onMedecinOrDateChange(): void {
    if (this.newMedecinId && this.newDate) {
      this.medecinService.getCreneauxDisponibles(this.newMedecinId, this.newDate).subscribe(list => {
        this.creneaux = list;
      });
    }
  }

  canCreate(): boolean {
    return !!(this.selectedPatient?.id && this.newMedecinId && this.newDate && this.newHeureDebut && this.newMotif);
  }

  create(): void {
    if (!this.canCreate()) return;
    const req: AppointmentCreateRequest = {
      patientId: this.selectedPatient.id,
      medecinId: this.newMedecinId!,
      date: this.newDate,
      heureDebut: this.newHeureDebut,
      motif: this.newMotif,
      notes: this.newNotes || undefined
    };
    this.appointmentService.createSecretaireAppointment(req).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Créé', detail: 'RDV créé avec succès' });
        this.showCreate = false;
        this.load();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec création RDV' })
    });
  }

  motifLabel(m: MotifConsultation): string {
    return this.motifOptions.find(o => o.value === m)?.label ?? m;
  }
  statutLabel(s: StatutAppointment): string {
    return this.statutOptions.find(o => o.value === s)?.label ?? s;
  }
  statutSeverity(s: StatutAppointment): 'success' | 'warning' | 'danger' | 'info' {
    switch (s) {
      case 'CONFIRME': return 'success';
      case 'EN_ATTENTE': return 'warning';
      case 'ANNULE': case 'NO_SHOW': return 'danger';
      default: return 'info';
    }
  }

  private todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
