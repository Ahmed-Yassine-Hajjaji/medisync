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
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';

import { AppointmentService } from '../../../core/services/appointment.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { Appointment, Disponibilite } from '../../../core/models/appointment.model';
import { JourSemainePipe } from '../../../shared/pipes/jour-semaine.pipe';
import { LucideDynamicIcon, LucideZap, LucidePlus } from '@lucide/angular';

@Component({
  selector: 'app-medecin-planning',
  standalone: true,
  imports: [
    CommonModule, FormsModule, FullCalendarModule,
    CardModule, ButtonModule, SelectButtonModule, DialogModule, TagModule,
    ToastModule, DropdownModule, InputTextModule, CheckboxModule, CalendarModule,
    JourSemainePipe, LucideDynamicIcon
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <header class="page-header">
      <div>
        <h1>Mon planning</h1>
        <p>Gérez vos rendez-vous et disponibilités</p>
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

    <button class="fab-urgence" (click)="openUrgence()" title="Bloquer un créneau urgence">
      <svg [lucideIcon]="iconUrgence" [size]="22"></svg>
    </button>

    <!-- Dialog créneau disponible / congé / urgence -->
    <p-dialog
      [header]="slotMode === 'URGENCE' ? 'Bloquer un créneau urgence' : 'Marquer disponible'"
      [(visible)]="showSlotDialog"
      [modal]="true"
      [style]="{width: '420px'}">
      <div class="slot-dialog">
        <div class="form-group">
          <label>Date</label>
          <input type="date" [(ngModel)]="slotDate" class="slot-input">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Début</label>
            <input type="time" [(ngModel)]="slotStart" class="slot-input">
          </div>
          <div class="form-group">
            <label>Fin</label>
            <input type="time" [(ngModel)]="slotEnd" class="slot-input">
          </div>
        </div>
        <label class="checkbox-row">
          <input type="checkbox" [(ngModel)]="slotConge"> Marquer comme congé/indisponible
        </label>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Annuler" styleClass="p-button-text" (onClick)="showSlotDialog = false"></p-button>
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="saveSlot()"></p-button>
      </ng-template>
    </p-dialog>

    <!-- Disponibilités récurrentes -->
    <p-card styleClass="mt-3">
      <ng-template pTemplate="header">
        <div class="card-header">
          <h2><i class="pi pi-clock"></i> Disponibilités récurrentes</h2>
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
          </div>
        } @empty {
          <p class="empty-state">Aucune disponibilité configurée</p>
        }
      </div>
    </p-card>

    <!-- Dialog détail RDV -->
    <p-dialog
      header="Détail du rendez-vous"
      [(visible)]="showEventDialog"
      [modal]="true"
      [style]="{width: '480px'}">
      @if (selectedAppointment) {
        <div class="event-details">
          <div class="detail-row">
            <strong>Patient</strong>
            <span>{{ selectedAppointment.patientPrenom }} {{ selectedAppointment.patientNom }}</span>
          </div>
          <div class="detail-row">
            <strong>Date</strong>
            <span>{{ formatDateFr(selectedAppointment.date) }}</span>
          </div>
          <div class="detail-row">
            <strong>Horaire</strong>
            <span>{{ selectedAppointment.heureDebut }} — {{ selectedAppointment.heureFin }}</span>
          </div>
          <div class="detail-row">
            <strong>Motif</strong>
            <p-tag [value]="motifLabel(selectedAppointment.motif)" [severity]="motifSeverity(selectedAppointment.motif)"></p-tag>
          </div>
          <div class="detail-row">
            <strong>Statut</strong>
            <p-tag [value]="statutLabel(selectedAppointment.statut)" [severity]="statutSeverity(selectedAppointment.statut)"></p-tag>
          </div>
          @if (selectedAppointment.notes) {
            <div class="detail-row">
              <strong>Notes</strong>
              <span>{{ selectedAppointment.notes }}</span>
            </div>
          }
        </div>
      }
      <ng-template pTemplate="footer">
        <p-button label="Fermer" styleClass="p-button-secondary p-button-text" (onClick)="showEventDialog = false"></p-button>
        @if (selectedAppointment?.statut === 'EN_ATTENTE') {
          <p-button label="Confirmer" icon="pi pi-check" styleClass="p-button-success" (onClick)="confirmAppointment()"></p-button>
        }
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      h1 { margin: 0; font-size: 1.5rem; }
      p { color: var(--gray-500); margin-top: 0.25rem; }
    }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }

    .legend {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .legend-item { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.875rem; color: var(--gray-700); }
    .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    .dot.blue { background: #3B82F6; }
    .dot.orange { background: #F59E0B; }
    .dot.red { background: #EF4444; }
    .dot.gray { background: #9CA3AF; }

    .mt-3 { margin-top: 1.5rem; }

    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.25rem 0;
      h2 { margin: 0; font-size: 1.125rem; display: flex; align-items: center; gap: 0.5rem; }
    }

    .dispo-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .dispo-row {
      display: grid;
      grid-template-columns: 110px 1fr auto;
      align-items: center;
      gap: 1rem;
      padding: 0.65rem 0;
      border-bottom: 1px solid var(--gray-100);
    }
    .dispo-jour { font-weight: 500; }
    .dispo-time { color: var(--gray-600); }

    .empty-state { text-align: center; padding: 2rem; color: var(--gray-500); }

    .event-details { display: flex; flex-direction: column; gap: 0.75rem; }
    .detail-row {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 1rem;
      align-items: center;
      strong { color: var(--gray-700); font-size: 0.875rem; }
    }

    :host ::ng-deep .fc { font-family: inherit; }
    :host ::ng-deep .fc .fc-toolbar-title { font-size: 1.1rem; text-transform: capitalize; }
    :host ::ng-deep .fc-event { cursor: pointer; border-radius: 4px; padding: 2px 4px; }
    :host ::ng-deep .planning-card .fc { min-height: calc(100vh - 280px); }

    .fab-urgence {
      position: fixed; right: 32px; bottom: 32px; z-index: 50;
      width: 56px; height: 56px; border-radius: 50%; border: none;
      background: #EF4444; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .fab-urgence:hover { transform: scale(1.08); box-shadow: 0 12px 28px rgba(239, 68, 68, 0.5); }

    .slot-dialog { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group label { display: block; font-weight: 500; color: #334155; margin-bottom: 0.375rem; font-size: 0.875rem; }
    .slot-input {
      width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 0.875rem; font-family: inherit;
    }
    .slot-input:focus { outline: none; border-color: #1E6FD9; }
    .checkbox-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #334155; cursor: pointer; }
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
  disponibilites: any[] = [];

  showEventDialog = false;
  selectedAppointment: Appointment | null = null;

  iconUrgence = LucideZap.icon;
  iconAdd = LucidePlus.icon;

  showSlotDialog = false;
  slotMode: 'DISPO' | 'URGENCE' = 'DISPO';
  slotDate = '';
  slotStart = '';
  slotEnd = '';
  slotConge = false;

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
    private messageService: MessageService
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
      next: (data) => {
        this.appointments = data;
        this.refreshEvents();
      }
    });
  }

  loadDisponibilites(): void {
    this.medecinService.getDisponibilites().subscribe({
      next: (data) => {
        this.disponibilites = data;
        this.refreshEvents();
      }
    });
  }

  refreshEvents(): void {
    const aptEvents: EventInput[] = this.appointments.map(apt => ({
      id: `apt-${apt.id}`,
      title: `${apt.patientPrenom} ${apt.patientNom}`,
      start: `${apt.date}T${apt.heureDebut}`,
      end: `${apt.date}T${apt.heureFin}`,
      backgroundColor: this.motifColor(apt.motif),
      borderColor: this.motifColor(apt.motif),
      extendedProps: { type: 'appointment', appointmentId: apt.id }
    }));

    // Disponibilités: congés en gris (events allDay)
    const dispoEvents: EventInput[] = this.disponibilites
      .filter(d => d.estConge && d.dateSpecifique)
      .map(d => ({
        id: `dispo-${d.id}`,
        title: 'Congé',
        start: d.dateSpecifique,
        allDay: true,
        backgroundColor: '#9CA3AF',
        borderColor: '#9CA3AF',
        editable: false
      }));

    this.calendarOptions = { ...this.calendarOptions, events: [...aptEvents, ...dispoEvents] };
  }

  motifColor(motif: string): string {
    switch (motif) {
      case 'URGENCE': return '#EF4444';
      case 'SUIVI': return '#F59E0B';
      case 'CONSULTATION_GENERALE': return '#3B82F6';
      default: return '#3B82F6';
    }
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
      case 'ANNULE':
      case 'NO_SHOW': return 'danger';
      default: return 'info';
    }
  }

  formatDateFr(iso: string): string {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('fr-MA', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(d);
  }

  onEventClick(arg: EventClickArg): void {
    const id = arg.event.extendedProps?.['appointmentId'];
    if (!id) return;
    this.selectedAppointment = this.appointments.find(a => a.id === id) ?? null;
    this.showEventDialog = !!this.selectedAppointment;
  }

  onEventDrop(arg: EventDropArg): void {
    // Drag&drop: pas d'endpoint backend dédié pour reprogrammer un RDV pour l'instant.
    // On informe l'utilisateur et on annule visuellement la modification.
    arg.revert();
    this.messageService.add({
      severity: 'info',
      summary: 'Déplacement non synchronisé',
      detail: 'La reprogrammation côté serveur n\'est pas encore disponible.'
    });
  }

  onSlotSelect(arg: DateSelectArg): void {
    this.slotMode = 'DISPO';
    this.slotDate = arg.startStr.slice(0, 10);
    this.slotStart = arg.start.toTimeString().slice(0, 5);
    this.slotEnd = arg.end.toTimeString().slice(0, 5);
    this.slotConge = false;
    this.showSlotDialog = true;
  }

  openUrgence(): void {
    const now = new Date();
    this.slotMode = 'URGENCE';
    this.slotDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.slotStart = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const end = new Date(now.getTime() + 30 * 60000);
    this.slotEnd = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
    this.slotConge = true;
    this.showSlotDialog = true;
  }

  saveSlot(): void {
    if (!this.slotDate || !this.slotStart || !this.slotEnd) return;
    const dispo: Disponibilite = {
      medecinId: 0,
      dateSpecifique: this.slotDate,
      heureDebut: this.slotStart,
      heureFin: this.slotEnd,
      estConge: this.slotConge,
      recurrent: false
    };
    this.medecinService.addDisponibilite(dispo).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.slotMode === 'URGENCE' ? 'Créneau urgence bloqué' : 'Disponibilité ajoutée'
        });
        this.showSlotDialog = false;
        this.loadDisponibilites();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec' })
    });
  }

  confirmAppointment(): void {
    if (!this.selectedAppointment) return;
    this.appointmentService.confirmAppointment(this.selectedAppointment.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'RDV confirmé' });
        this.showEventDialog = false;
        this.loadAppointments();
      }
    });
  }
}
