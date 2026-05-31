import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, EventClickArg, EventDropArg, DateSelectArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AppointmentService } from '../../../core/services/appointment.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { Appointment, Disponibilite } from '../../../core/models/appointment.model';
import { JourSemainePipe } from '../../../shared/pipes/jour-semaine.pipe';

@Component({
  selector: 'app-medecin-planning',
  standalone: true,
  imports: [
    CommonModule, FormsModule, FullCalendarModule,
    CardModule, ButtonModule, SelectButtonModule, DialogModule, TagModule,
    ToastModule, DropdownModule, InputTextModule, InputTextareaModule,
    CheckboxModule, CalendarModule, ConfirmDialogModule,
    JourSemainePipe
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <header class="page-header">
      <div>
        <h1>Mon planning</h1>
        <p class="subtitle">Gérez vos rendez-vous et disponibilités</p>
      </div>
      <div class="header-actions">
        <p-selectButton
          [options]="viewOptions"
          [(ngModel)]="currentView"
          optionLabel="label"
          optionValue="value"
          (onChange)="changeView()"></p-selectButton>
      </div>
    </header>

    <div class="legend">
      <span class="legend-item"><span class="dot blue"></span> Consultation générale</span>
      <span class="legend-item"><span class="dot orange"></span> Suivi</span>
      <span class="legend-item"><span class="dot red"></span> Urgence</span>
      <span class="legend-item"><span class="dot gray"></span> Indisponible / Congé</span>
    </div>

    <p-card styleClass="planning-card">
      <full-calendar #calendar [options]="calendarOptions"></full-calendar>
    </p-card>

    <!-- FAB Urgence -->
    <button class="fab-urgence" (click)="openUrgenceDialog()" title="Créer un RDV urgence">
      <i class="pi pi-bolt"></i>
    </button>

    <!-- ==================== DIALOG RDV DETAIL ==================== -->
    <p-dialog
      header="Détail du rendez-vous"
      [(visible)]="showEventDialog"
      [modal]="true"
      [style]="{width: '560px', maxWidth: '95vw'}"
      [contentStyle]="{'padding': '1.5rem'}"
      [draggable]="false">
      @if (selectedAppointment) {
        <div class="detail-grid">
          <div class="detail-row">
            <label>Patient</label>
            <span class="detail-value">{{ selectedAppointment.patientPrenom }} {{ selectedAppointment.patientNom }}</span>
          </div>
          <div class="detail-row">
            <label>Date</label>
            <span class="detail-value">{{ formatDateFr(selectedAppointment.date) }}</span>
          </div>
          <div class="detail-row">
            <label>Horaire</label>
            <span class="detail-value">{{ selectedAppointment.heureDebut }} — {{ selectedAppointment.heureFin }}</span>
          </div>
          <div class="detail-row">
            <label>Motif</label>
            <p-tag [value]="motifLabel(selectedAppointment.motif)" [severity]="motifSeverity(selectedAppointment.motif)"></p-tag>
          </div>
          <div class="detail-row">
            <label>Statut</label>
            <p-tag [value]="statutLabel(selectedAppointment.statut)" [severity]="statutSeverity(selectedAppointment.statut)"></p-tag>
          </div>
          @if (selectedAppointment.notes) {
            <div class="detail-row">
              <label>Notes</label>
              <span class="detail-value">{{ selectedAppointment.notes }}</span>
            </div>
          }
        </div>

        <!-- Reschedule section -->
        @if (selectedAppointment.statut !== 'ANNULE' && selectedAppointment.statut !== 'TERMINE') {
          <div class="reschedule-section">
            <h4><i class="pi pi-calendar-plus"></i> Reprogrammer</h4>
            <div class="form-row-2">
              <div class="form-group">
                <label>Nouvelle date</label>
                <input type="date" [(ngModel)]="rescheduleDate" class="form-input">
              </div>
              <div class="form-group">
                <label>Nouvelle heure</label>
                <input type="time" [(ngModel)]="rescheduleTime" class="form-input">
              </div>
            </div>
            <div class="reschedule-actions">
              <p-button
                label="Reprogrammer"
                icon="pi pi-refresh"
                styleClass="p-button-warning p-button-sm"
                (onClick)="rescheduleAppointment()"
                [disabled]="!rescheduleDate || !rescheduleTime"></p-button>
            </div>
          </div>
        }
      }
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <p-button label="Fermer" styleClass="p-button-text" (onClick)="showEventDialog = false"></p-button>
          @if (selectedAppointment?.statut === 'EN_ATTENTE') {
            <p-button label="Confirmer" icon="pi pi-check" styleClass="p-button-success" (onClick)="confirmAppointment()"></p-button>
          }
          @if (selectedAppointment?.statut === 'CONFIRME') {
            <p-button label="Créer consultation" icon="pi pi-file-edit" (onClick)="createConsultationFromAppointment()"></p-button>
          }
          @if (selectedAppointment?.statut !== 'ANNULE' && selectedAppointment?.statut !== 'TERMINE') {
            <p-button label="Annuler RDV" icon="pi pi-times" styleClass="p-button-danger p-button-outlined" (onClick)="cancelAppointment()"></p-button>
          }
          @if (selectedAppointment?.statut === 'CONFIRME') {
            <p-button label="Absent" icon="pi pi-user-minus" styleClass="p-button-secondary p-button-outlined" (onClick)="markNoShow()"></p-button>
          }
        </div>
      </ng-template>
    </p-dialog>

    <!-- ==================== DIALOG URGENCE ==================== -->
    <p-dialog
      header="Créer un rendez-vous urgence"
      [(visible)]="showUrgenceDialog"
      [modal]="true"
      [style]="{width: '620px', maxWidth: '95vw'}"
      [contentStyle]="{'padding': '1.5rem'}"
      [draggable]="false">
      <div class="urgence-form">
        <div class="urgence-badge">
          <i class="pi pi-exclamation-triangle"></i>
          <span>Mode urgence — Le RDV sera créé avec le statut confirmé</span>
        </div>

        <div class="form-group">
          <label>Rechercher un patient *</label>
          <input
            pInputText
            [(ngModel)]="urgencePatientSearch"
            (input)="searchPatients()"
            placeholder="Nom ou prénom du patient..."
            class="w-full">
          @if (patientResults.length > 0) {
            <div class="patient-dropdown">
              @for (p of patientResults; track p.id) {
                <div class="patient-option" [class.selected]="urgencePatientId === p.id" (click)="selectPatient(p)">
                  <strong>{{ p.prenom }} {{ p.nom }}</strong>
                  <small>{{ p.email }}</small>
                </div>
              }
            </div>
          }
          @if (selectedPatientName) {
            <div class="selected-patient">
              <i class="pi pi-user"></i> {{ selectedPatientName }}
            </div>
          }
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label>Date *</label>
            <input type="date" [(ngModel)]="urgenceDate" class="form-input">
          </div>
          <div class="form-group">
            <label>Heure *</label>
            <input type="time" [(ngModel)]="urgenceTime" class="form-input">
          </div>
        </div>

        <div class="form-group">
          <label>Notes / Motif</label>
          <textarea
            pInputTextarea
            [(ngModel)]="urgenceNotes"
            rows="3"
            placeholder="Décrivez brièvement le motif de l'urgence..."
            class="w-full"></textarea>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Annuler" styleClass="p-button-text" (onClick)="showUrgenceDialog = false"></p-button>
        <p-button
          label="Créer le RDV urgence"
          icon="pi pi-bolt"
          styleClass="p-button-danger"
          (onClick)="saveUrgence()"
          [disabled]="!urgencePatientId || !urgenceDate || !urgenceTime"></p-button>
      </ng-template>
    </p-dialog>

    <!-- ==================== DIALOG DISPO / CONGE ==================== -->
    <p-dialog
      [header]="slotConge ? 'Ajouter un congé / indisponibilité' : 'Ajouter une disponibilité'"
      [(visible)]="showSlotDialog"
      [modal]="true"
      [style]="{width: '540px', maxWidth: '95vw'}"
      [contentStyle]="{'padding': '1.5rem'}"
      [draggable]="false">
      <div class="slot-form">
        <label class="checkbox-row">
          <input type="checkbox" [(ngModel)]="slotRecurrent"> Récurrent (chaque semaine)
        </label>

        @if (slotRecurrent) {
          <div class="form-group">
            <label>Jour de la semaine</label>
            <select [(ngModel)]="slotJourSemaine" class="form-input">
              <option value="MONDAY">Lundi</option>
              <option value="TUESDAY">Mardi</option>
              <option value="WEDNESDAY">Mercredi</option>
              <option value="THURSDAY">Jeudi</option>
              <option value="FRIDAY">Vendredi</option>
              <option value="SATURDAY">Samedi</option>
              <option value="SUNDAY">Dimanche</option>
            </select>
          </div>
        } @else {
          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="slotDate" class="form-input">
          </div>
        }

        <div class="form-row-2">
          <div class="form-group">
            <label>Heure début</label>
            <input type="time" [(ngModel)]="slotStart" class="form-input">
          </div>
          <div class="form-group">
            <label>Heure fin</label>
            <input type="time" [(ngModel)]="slotEnd" class="form-input">
          </div>
        </div>

        <label class="checkbox-row conge-check">
          <input type="checkbox" [(ngModel)]="slotConge">
          <span>Marquer comme congé / indisponible</span>
        </label>
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Annuler" styleClass="p-button-text" (onClick)="showSlotDialog = false"></p-button>
        <p-button
          label="Enregistrer"
          icon="pi pi-check"
          (onClick)="saveSlot()"
          [disabled]="!slotStart || !slotEnd || (!slotRecurrent && !slotDate)"></p-button>
      </ng-template>
    </p-dialog>

    <!-- ==================== DISPONIBILITES RECURRENTES ==================== -->
    <p-card styleClass="mt-4">
      <ng-template pTemplate="header">
        <div class="card-header-dispo">
          <h2><i class="pi pi-clock"></i> Disponibilités récurrentes</h2>
          <p-button
            label="Ajouter"
            icon="pi pi-plus"
            styleClass="p-button-sm p-button-outlined"
            (onClick)="openAddDispo()"></p-button>
        </div>
      </ng-template>

      <div class="dispo-list">
        @for (d of disponibilites; track d.id) {
          <div class="dispo-row">
            <span class="dispo-jour">{{ d.jourSemaine | jourSemaine }}</span>
            <span class="dispo-time">{{ d.heureDebut }} — {{ d.heureFin }}</span>
            @if (d.estConge) {
              <p-tag value="Congé" severity="warning"></p-tag>
            } @else {
              <p-tag value="Ouvert" severity="success"></p-tag>
            }
            <button class="btn-delete-dispo" (click)="deleteDispo(d)" title="Supprimer">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        } @empty {
          <p class="empty-state">Aucune disponibilité configurée</p>
        }
      </div>
    </p-card>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
      h1 { margin: 0; font-size: 1.5rem; }
      .subtitle { color: var(--gray-500); margin-top: 0.25rem; }
    }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }

    .legend { display: flex; gap: 1.25rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .legend-item { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.875rem; color: var(--gray-700); }
    .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    .dot.blue { background: #3B82F6; } .dot.orange { background: #F59E0B; }
    .dot.red { background: #EF4444; } .dot.gray { background: #9CA3AF; }

    .mt-4 { margin-top: 1.5rem; }

    :host ::ng-deep .fc { font-family: inherit; }
    :host ::ng-deep .fc .fc-toolbar-title { font-size: 1.1rem; text-transform: capitalize; }
    :host ::ng-deep .fc-event { cursor: pointer; border-radius: 4px; padding: 2px 6px; font-size: 0.8rem; }
    :host ::ng-deep .planning-card .fc { min-height: calc(100vh - 280px); }
    :host ::ng-deep .fc .fc-button-primary { background: var(--primary); border-color: var(--primary); }

    .fab-urgence {
      position: fixed; right: 32px; bottom: 32px; z-index: 50;
      width: 56px; height: 56px; border-radius: 50%; border: none;
      background: #EF4444; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      font-size: 1.25rem;
    }
    .fab-urgence:hover { transform: scale(1.08); box-shadow: 0 12px 28px rgba(239, 68, 68, 0.5); }

    /* Detail dialog */
    .detail-grid { display: flex; flex-direction: column; gap: 0.85rem; }
    .detail-row {
      display: grid; grid-template-columns: 120px 1fr; gap: 1rem; align-items: center;
      label { font-weight: 600; color: var(--gray-600); font-size: 0.875rem; }
      .detail-value { font-size: 0.95rem; }
    }
    .reschedule-section {
      margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--gray-200);
      h4 { margin: 0 0 0.75rem; font-size: 0.95rem; color: var(--gray-700); display: flex; align-items: center; gap: 0.4rem; }
    }
    .reschedule-actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
    .dialog-footer { display: flex; gap: 0.5rem; justify-content: flex-end; flex-wrap: wrap; }

    /* Shared form styles */
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; font-weight: 500; color: #334155; margin-bottom: 0.375rem; font-size: 0.875rem; }
    .form-input {
      width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 0.9rem; font-family: inherit; background: white;
    }
    .form-input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .w-full { width: 100%; }

    .checkbox-row {
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #334155; cursor: pointer;
      margin-bottom: 0.75rem;
      input[type="checkbox"] { width: 18px; height: 18px; accent-color: #3B82F6; }
    }
    .conge-check { margin-top: 0.5rem; margin-bottom: 0; }

    /* Urgence form */
    .urgence-form { display: flex; flex-direction: column; gap: 0.25rem; }
    .urgence-badge {
      display: flex; align-items: center; gap: 0.5rem;
      background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;
      padding: 0.75rem 1rem; margin-bottom: 1rem;
      color: #DC2626; font-size: 0.875rem; font-weight: 500;
      i { font-size: 1.1rem; }
    }
    .patient-dropdown {
      max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px;
      margin-top: 0.25rem; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .patient-option {
      padding: 0.6rem 0.75rem; cursor: pointer; border-bottom: 1px solid #f1f5f9;
      display: flex; flex-direction: column; gap: 0.15rem;
      &:hover, &.selected { background: #EFF6FF; }
      strong { font-size: 0.9rem; } small { color: var(--gray-500); font-size: 0.8rem; }
    }
    .selected-patient {
      display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;
      padding: 0.5rem 0.75rem; background: #EFF6FF; border-radius: 8px;
      color: #1D4ED8; font-weight: 500; font-size: 0.9rem;
    }

    /* Slot form */
    .slot-form { display: flex; flex-direction: column; gap: 0.25rem; }

    /* Dispo list */
    .card-header-dispo {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.25rem 0;
      h2 { margin: 0; font-size: 1.125rem; display: flex; align-items: center; gap: 0.5rem; }
    }
    .dispo-list { display: flex; flex-direction: column; gap: 0.25rem; }
    .dispo-row {
      display: grid; grid-template-columns: 110px 1fr auto auto; align-items: center; gap: 1rem;
      padding: 0.65rem 0; border-bottom: 1px solid var(--gray-100);
    }
    .dispo-jour { font-weight: 500; }
    .dispo-time { color: var(--gray-600); }
    .btn-delete-dispo {
      background: none; border: none; color: #EF4444; cursor: pointer; padding: 0.25rem;
      border-radius: 4px; display: flex; align-items: center;
      &:hover { background: #FEF2F2; }
    }
    .empty-state { text-align: center; padding: 2rem; color: var(--gray-500); }
  `]
})
export class MedecinPlanningComponent implements OnInit {
  @ViewChild('calendar') calendar!: FullCalendarComponent;

  currentView: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth' = 'timeGridWeek';
  viewOptions = [
    { label: 'Jour', value: 'timeGridDay' },
    { label: 'Semaine', value: 'timeGridWeek' },
    { label: 'Mois', value: 'dayGridMonth' }
  ];

  appointments: Appointment[] = [];
  disponibilites: Disponibilite[] = [];

  // RDV detail dialog
  showEventDialog = false;
  selectedAppointment: Appointment | null = null;
  rescheduleDate = '';
  rescheduleTime = '';

  // Urgence dialog
  showUrgenceDialog = false;
  urgencePatientSearch = '';
  urgencePatientId: number | null = null;
  selectedPatientName = '';
  urgenceDate = '';
  urgenceTime = '';
  urgenceNotes = '';
  patientResults: any[] = [];
  private searchTimeout: any;

  // Slot / Dispo dialog
  showSlotDialog = false;
  slotDate = '';
  slotStart = '';
  slotEnd = '';
  slotConge = false;
  slotRecurrent = false;
  slotJourSemaine = 'MONDAY';

  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: frLocale,
    firstDay: 1,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    editable: true,
    droppable: true,
    selectable: true,
    selectMirror: true,
    eventClick: (arg) => this.onEventClick(arg),
    eventDrop: (arg) => this.onEventDrop(arg),
    select: (arg) => this.onSlotSelect(arg),
    events: []
  };

  constructor(
    private appointmentService: AppointmentService,
    private medecinService: MedecinService,
    private consultationService: ConsultationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadDisponibilites();
  }

  changeView(): void {
    this.calendar?.getApi().changeView(this.currentView);
  }

  loadAppointments(): void {
    this.appointmentService.getMedecinAppointments().subscribe({
      next: (data) => { this.appointments = data; this.refreshEvents(); }
    });
  }

  loadDisponibilites(): void {
    this.medecinService.getDisponibilites().subscribe({
      next: (data) => { this.disponibilites = data; this.refreshEvents(); }
    });
  }

  refreshEvents(): void {
    const aptEvents: EventInput[] = this.appointments.map(apt => ({
      id: `apt-${apt.id}`,
      title: `${apt.heureDebut?.slice(0,5)} ${apt.patientPrenom} ${apt.patientNom}`,
      start: `${apt.date}T${apt.heureDebut}`,
      end: `${apt.date}T${apt.heureFin}`,
      backgroundColor: this.motifColor(apt.motif),
      borderColor: this.motifColor(apt.motif),
      extendedProps: { type: 'appointment', appointmentId: apt.id }
    }));

    const dispoEvents: EventInput[] = this.disponibilites
      .filter(d => d.estConge && d.dateSpecifique)
      .map(d => ({
        id: `dispo-${d.id}`,
        title: 'Congé',
        start: d.dateSpecifique,
        allDay: true,
        backgroundColor: '#9CA3AF',
        borderColor: '#9CA3AF',
        editable: false,
        extendedProps: { type: 'conge' }
      }));

    this.calendarOptions = { ...this.calendarOptions, events: [...aptEvents, ...dispoEvents] };
  }

  // ===== Event handlers =====
  onEventClick(arg: EventClickArg): void {
    const props = arg.event.extendedProps;
    if (props?.['type'] === 'conge') return;
    const id = props?.['appointmentId'];
    if (!id) return;
    this.selectedAppointment = this.appointments.find(a => a.id === id) ?? null;
    if (this.selectedAppointment) {
      this.rescheduleDate = this.selectedAppointment.date;
      this.rescheduleTime = this.selectedAppointment.heureDebut?.slice(0, 5) || '';
      this.showEventDialog = true;
    }
  }

  onEventDrop(arg: EventDropArg): void {
    const id = arg.event.extendedProps?.['appointmentId'];
    if (!id) { arg.revert(); return; }

    const newStart = arg.event.start;
    if (!newStart) { arg.revert(); return; }

    const newDate = newStart.toISOString().split('T')[0];

    // In month view, the event may not have a time, so preserve the original time
    let newTime: string;
    const apt = this.appointments.find(a => a.id === id);
    if (arg.view.type === 'dayGridMonth' && apt) {
      // Keep original time when moving in month view (only date changes)
      newTime = apt.heureDebut;
    } else {
      newTime = `${String(newStart.getHours()).padStart(2,'0')}:${String(newStart.getMinutes()).padStart(2,'0')}:00`;
    }

    // Ensure time has seconds format
    if (newTime && newTime.length === 5) newTime = newTime + ':00';

    this.appointmentService.rescheduleMedecinAppointment(id, newDate, newTime).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'RDV déplacé', detail: 'Le rendez-vous a été reprogrammé.' });
        this.loadAppointments();
      },
      error: (err) => {
        arg.revert();
        const detail = err.error?.message || err.error || 'Impossible de reprogrammer ce RDV.';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: typeof detail === 'string' ? detail : 'Erreur de reprogrammation' });
      }
    });
  }

  onSlotSelect(arg: DateSelectArg): void {
    this.slotDate = arg.startStr.slice(0, 10);
    this.slotStart = arg.start.toTimeString().slice(0, 5);
    this.slotEnd = arg.end.toTimeString().slice(0, 5);
    this.slotConge = false;
    this.slotRecurrent = false;
    this.showSlotDialog = true;
  }

  // ===== Appointment actions =====
  confirmAppointment(): void {
    if (!this.selectedAppointment) return;
    this.appointmentService.confirmAppointment(this.selectedAppointment.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'RDV confirmé' });
        this.showEventDialog = false;
        this.loadAppointments();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur' })
    });
  }

  cancelAppointment(): void {
    if (!this.selectedAppointment) return;
    this.confirmationService.confirm({
      message: `Annuler le RDV de ${this.selectedAppointment.patientPrenom} ${this.selectedAppointment.patientNom} ?`,
      header: 'Confirmer l\'annulation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.appointmentService.cancelMedecinAppointment(this.selectedAppointment!.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'RDV annulé' });
            this.showEventDialog = false;
            this.loadAppointments();
          }
        });
      }
    });
  }

  markNoShow(): void {
    if (!this.selectedAppointment) return;
    this.appointmentService.markNoShow(this.selectedAppointment.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Patient marqué absent' });
        this.showEventDialog = false;
        this.loadAppointments();
      }
    });
  }

  rescheduleAppointment(): void {
    if (!this.selectedAppointment || !this.rescheduleDate || !this.rescheduleTime) return;
    const timeSlot = this.rescheduleTime.length === 5 ? this.rescheduleTime + ':00' : this.rescheduleTime;
    this.appointmentService.rescheduleMedecinAppointment(this.selectedAppointment.id, this.rescheduleDate, timeSlot).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'RDV reprogrammé' });
        this.showEventDialog = false;
        this.loadAppointments();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur de reprogrammation' })
    });
  }

  createConsultationFromAppointment(): void {
    if (!this.selectedAppointment) return;
    this.consultationService.createConsultation(this.selectedAppointment.id, {}).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Consultation créée', detail: 'Allez dans l\'onglet Consultations pour la remplir.' });
        this.showEventDialog = false;
        this.loadAppointments();
      },
      error: (err) => {
        const msg = err.error?.message || err.error || 'Erreur lors de la création';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: typeof msg === 'string' ? msg : 'Impossible de créer la consultation' });
      }
    });
  }

  // ===== Urgence =====
  openUrgenceDialog(): void {
    const now = new Date();
    this.urgenceDate = now.toISOString().split('T')[0];
    this.urgenceTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    this.urgenceNotes = '';
    this.urgencePatientSearch = '';
    this.urgencePatientId = null;
    this.selectedPatientName = '';
    this.patientResults = [];
    this.showUrgenceDialog = true;
  }

  searchPatients(): void {
    clearTimeout(this.searchTimeout);
    if (this.urgencePatientSearch.length < 2) { this.patientResults = []; return; }
    this.searchTimeout = setTimeout(() => {
      this.medecinService.searchPatients(this.urgencePatientSearch).subscribe({
        next: (results) => this.patientResults = results,
        error: () => this.patientResults = []
      });
    }, 300);
  }

  selectPatient(p: any): void {
    this.urgencePatientId = p.id;
    this.selectedPatientName = `${p.prenom} ${p.nom}`;
    this.patientResults = [];
    this.urgencePatientSearch = '';
  }

  saveUrgence(): void {
    if (!this.urgencePatientId || !this.urgenceDate || !this.urgenceTime) return;
    const request = {
      patientId: this.urgencePatientId,
      medecinId: 0,
      date: this.urgenceDate,
      heureDebut: this.urgenceTime.length === 5 ? this.urgenceTime + ':00' : this.urgenceTime,
      motif: 'URGENCE' as const,
      notes: this.urgenceNotes || 'Urgence'
    };
    this.appointmentService.createSecretaireAppointment(request).subscribe({
      next: (apt) => {
        // Auto-confirm the urgence
        this.appointmentService.confirmAppointment(apt.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Urgence créée', detail: `RDV urgence confirmé pour ${this.selectedPatientName}` });
            this.showUrgenceDialog = false;
            this.loadAppointments();
          }
        });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de créer le RDV urgence.' })
    });
  }

  // ===== Disponibilités =====
  openAddDispo(): void {
    this.slotDate = '';
    this.slotStart = '09:00';
    this.slotEnd = '12:30';
    this.slotConge = false;
    this.slotRecurrent = true;
    this.slotJourSemaine = 'MONDAY';
    this.showSlotDialog = true;
  }

  saveSlot(): void {
    if (!this.slotStart || !this.slotEnd) return;
    const dispo: Disponibilite = {
      medecinId: 0,
      heureDebut: this.slotStart.length === 5 ? this.slotStart + ':00' : this.slotStart,
      heureFin: this.slotEnd.length === 5 ? this.slotEnd + ':00' : this.slotEnd,
      estConge: this.slotConge,
      recurrent: this.slotRecurrent
    };
    if (this.slotRecurrent) {
      dispo.jourSemaine = this.slotJourSemaine;
    } else {
      dispo.dateSpecifique = this.slotDate;
    }
    this.medecinService.addDisponibilite(dispo).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.slotConge ? 'Congé ajouté' : 'Disponibilité ajoutée' });
        this.showSlotDialog = false;
        this.loadDisponibilites();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur' })
    });
  }

  deleteDispo(d: Disponibilite): void {
    if (!d.id) return;
    this.confirmationService.confirm({
      message: 'Supprimer cette disponibilité ?',
      header: 'Confirmer la suppression',
      icon: 'pi pi-trash',
      accept: () => {
        this.medecinService.deleteDisponibilite(d.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Disponibilité supprimée' });
            this.loadDisponibilites();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erreur' })
        });
      }
    });
  }

  // ===== Helpers =====
  motifColor(motif: string): string {
    switch (motif) {
      case 'URGENCE': return '#EF4444';
      case 'SUIVI': return '#F59E0B';
      default: return '#3B82F6';
    }
  }

  motifLabel(m: string): string {
    const map: Record<string, string> = {
      CONSULTATION_GENERALE: 'Consultation générale', SUIVI: 'Suivi', URGENCE: 'Urgence',
      VACCINATION: 'Vaccination', CERTIFICAT_MEDICAL: 'Certificat médical',
      RENOUVELLEMENT_ORDONNANCE: 'Renouvellement', AUTRE: 'Autre'
    };
    return map[m] ?? m;
  }

  motifSeverity(m: string): 'info' | 'warning' | 'danger' {
    if (m === 'URGENCE') return 'danger';
    if (m === 'SUIVI') return 'warning';
    return 'info';
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'En attente', CONFIRME: 'Confirmé',
      ANNULE: 'Annulé', TERMINE: 'Terminé', NO_SHOW: 'Absent'
    };
    return map[s] ?? s;
  }

  statutSeverity(s: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (s) {
      case 'CONFIRME': return 'success';
      case 'EN_ATTENTE': return 'warning';
      case 'ANNULE': case 'NO_SHOW': return 'danger';
      default: return 'info';
    }
  }

  formatDateFr(iso: string): string {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('fr-MA', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(d);
  }
}
