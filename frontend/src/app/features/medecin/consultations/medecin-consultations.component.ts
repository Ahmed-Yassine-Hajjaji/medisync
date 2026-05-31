import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ConsultationService } from '../../../core/services/consultation.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Consultation, Prescription } from '../../../core/models/consultation.model';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-medecin-consultations',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ButtonModule, InputTextModule, InputTextareaModule,
    DividerModule, TagModule, ToastModule, InputNumberModule,
    DialogModule, DropdownModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <header class="page-header">
      <div>
        <h1>Consultations</h1>
        <p class="subtitle">Gérer les dossiers patients et prescriptions</p>
      </div>
      <div class="header-actions">
        <p-button
          label="Nouvelle consultation"
          icon="pi pi-plus"
          (onClick)="openNewConsultDialog()"></p-button>
      </div>
    </header>

    <div class="split-layout">
      <!-- Left: list -->
      <div class="list-panel">
        <p-card>
          <ng-template pTemplate="header">
            <div class="list-header">
              <h2><i class="pi pi-list"></i> Historique</h2>
              <span class="count-badge">{{ consultations.length }}</span>
            </div>
          </ng-template>

          <div class="search-box">
            <i class="pi pi-search"></i>
            <input
              pInputText
              [(ngModel)]="searchText"
              placeholder="Rechercher un patient..."
              class="search-input">
          </div>

          <div class="consult-list">
            @for (c of filteredConsultations; track c.id) {
              <div
                class="consult-item"
                [class.active]="selectedConsult?.id === c.id"
                (click)="onSelectConsultation(c)">
                <div class="consult-item-header">
                  <strong>{{ c.patientNom }}</strong>
                  <small class="consult-date">{{ formatDate(c.dateConsultation) }}</small>
                </div>
                @if (c.diagnostic) {
                  <p class="diag-preview">{{ c.diagnostic }}</p>
                }
                @if (c.motif) {
                  <span class="motif-chip">{{ c.motif }}</span>
                }
              </div>
            } @empty {
              <div class="empty-list">
                <i class="pi pi-inbox"></i>
                <p>Aucune consultation</p>
              </div>
            }
          </div>
        </p-card>
      </div>

      <!-- Right: detail -->
      <div class="detail-panel">
        @if (selectedConsult) {
          <p-card>
            <ng-template pTemplate="header">
              <div class="detail-header">
                <div class="patient-badge">
                  <div class="avatar">{{ getInitials(selectedConsult.patientNom) }}</div>
                  <div>
                    <h2>{{ selectedConsult.patientNom }}</h2>
                    <small>Consultation du {{ formatDate(selectedConsult.dateConsultation) }}</small>
                  </div>
                </div>
                <div class="detail-actions">
                  <p-button
                    label="PDF Ordonnance"
                    icon="pi pi-file-pdf"
                    styleClass="p-button-outlined"
                    (onClick)="generatePrescriptionPdf()"
                    [disabled]="!selectedConsult.prescriptions?.length"></p-button>
                  <p-button
                    label="Enregistrer"
                    icon="pi pi-save"
                    (onClick)="saveConsultation()"></p-button>
                </div>
              </div>
            </ng-template>

            <div class="form-sections">
              <!-- Motif -->
              <section class="form-section">
                <div class="section-title">
                  <i class="pi pi-bookmark"></i>
                  <h3>Motif de consultation</h3>
                </div>
                <input pInputText [(ngModel)]="selectedConsult.motif" placeholder="Motif de la visite" class="w-full" />
              </section>

              <!-- Examen clinique -->
              <section class="form-section">
                <div class="section-title">
                  <i class="pi pi-search"></i>
                  <h3>Examen clinique</h3>
                </div>
                <textarea
                  pInputTextarea
                  [(ngModel)]="selectedConsult.symptomes"
                  rows="3"
                  placeholder="Symptômes, signes vitaux, examen physique..."
                  class="w-full"></textarea>
              </section>

              <!-- Diagnostic -->
              <section class="form-section">
                <div class="section-title">
                  <i class="pi pi-check-circle"></i>
                  <h3>Diagnostic</h3>
                </div>
                <textarea
                  pInputTextarea
                  [(ngModel)]="selectedConsult.diagnostic"
                  rows="3"
                  placeholder="Diagnostic principal"
                  class="w-full"></textarea>
                <textarea
                  pInputTextarea
                  [(ngModel)]="selectedConsult.compteRendu"
                  rows="3"
                  placeholder="Compte rendu détaillé..."
                  class="w-full mt-2"></textarea>
              </section>

              <!-- Recommandations -->
              <section class="form-section">
                <div class="section-title">
                  <i class="pi pi-info-circle"></i>
                  <h3>Recommandations</h3>
                </div>
                <textarea
                  pInputTextarea
                  [(ngModel)]="selectedConsult.recommandations"
                  rows="2"
                  placeholder="Recommandations au patient..."
                  class="w-full"></textarea>
              </section>

              <p-divider></p-divider>

              <!-- Prescriptions -->
              <section class="form-section">
                <div class="section-title">
                  <i class="pi pi-heart"></i>
                  <h3>Prescriptions</h3>
                  <span class="presc-count">{{ selectedConsult.prescriptions?.length ?? 0 }}</span>
                </div>

                @if (selectedConsult.prescriptions?.length) {
                  <div class="prescriptions-list">
                    @for (presc of selectedConsult.prescriptions; track presc.id ?? $index) {
                      <div class="prescription-card">
                        <div class="presc-main">
                          <div class="presc-icon"><i class="pi pi-heart-fill"></i></div>
                          <div class="presc-info">
                            <strong>{{ presc.medicament }}</strong>
                            <span class="presc-dosage">{{ presc.dosage }}</span>
                          </div>
                        </div>
                        <div class="presc-details">
                          <span><i class="pi pi-sync"></i> {{ presc.frequence }}</span>
                          <span><i class="pi pi-calendar"></i> {{ presc.dureeJours }} jours</span>
                        </div>
                        @if (presc.instructions) {
                          <div class="presc-instructions">
                            <i class="pi pi-info-circle"></i> {{ presc.instructions }}
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                <!-- Add prescription form -->
                <div class="add-presc-form">
                  <h4>Ajouter un médicament</h4>
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label>Médicament *</label>
                      <input pInputText [(ngModel)]="newPrescription.medicament" placeholder="Nom du médicament" class="w-full" />
                    </div>
                    <div class="form-group">
                      <label>Dosage</label>
                      <input pInputText [(ngModel)]="newPrescription.dosage" placeholder="ex: 500 mg" class="w-full" />
                    </div>
                  </div>
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label>Fréquence</label>
                      <input pInputText [(ngModel)]="newPrescription.frequence" placeholder="ex: 3x/jour" class="w-full" />
                    </div>
                    <div class="form-group">
                      <label>Durée (jours)</label>
                      <p-inputNumber
                        [(ngModel)]="newPrescription.dureeJours"
                        [min]="1"
                        [showButtons]="true"
                        styleClass="w-full"></p-inputNumber>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Instructions</label>
                    <textarea pInputTextarea [(ngModel)]="newPrescription.instructions" rows="2"
                      placeholder="Instructions spéciales (avant/après repas, etc.)" class="w-full"></textarea>
                  </div>
                  <div class="add-presc-actions">
                    <p-button
                      label="Ajouter"
                      icon="pi pi-plus"
                      styleClass="p-button-outlined"
                      (onClick)="addPrescription()"></p-button>
                  </div>
                </div>
              </section>
            </div>
          </p-card>
        } @else {
          <p-card styleClass="empty-card">
            <div class="empty-detail">
              <i class="pi pi-file"></i>
              <h3>Sélectionnez une consultation</h3>
              <p>Choisissez une consultation dans la liste ou créez-en une nouvelle</p>
            </div>
          </p-card>
        }
      </div>
    </div>

    <!-- ===== Dialog: Nouvelle consultation depuis un RDV ===== -->
    <p-dialog
      header="Nouvelle consultation"
      [(visible)]="showNewConsultDialog"
      [modal]="true"
      [style]="{width: '580px', maxWidth: '95vw'}"
      [contentStyle]="{'padding': '1.5rem'}"
      [draggable]="false">
      <div class="new-consult-form">
        <p class="dialog-desc">Sélectionnez un rendez-vous confirmé pour démarrer une consultation.</p>

        @if (confirmingAppointments.length === 0) {
          <div class="no-rdv">
            <i class="pi pi-calendar-times"></i>
            <p>Aucun rendez-vous confirmé disponible</p>
          </div>
        } @else {
          <div class="rdv-list">
            @for (apt of confirmingAppointments; track apt.id) {
              <div
                class="rdv-option"
                [class.selected]="selectedAptForConsult === apt.id"
                (click)="selectedAptForConsult = apt.id">
                <div class="rdv-radio">
                  <span class="radio-dot" [class.active]="selectedAptForConsult === apt.id"></span>
                </div>
                <div class="rdv-info">
                  <strong>{{ apt.patientPrenom }} {{ apt.patientNom }}</strong>
                  <div class="rdv-meta">
                    <span><i class="pi pi-calendar"></i> {{ formatDate(apt.date) }}</span>
                    <span><i class="pi pi-clock"></i> {{ apt.heureDebut }}</span>
                    <p-tag [value]="motifLabel(apt.motif)" [severity]="motifSeverity(apt.motif)" styleClass="p-tag-sm"></p-tag>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Annuler" styleClass="p-button-text" (onClick)="showNewConsultDialog = false"></p-button>
        <p-button
          label="Créer la consultation"
          icon="pi pi-check"
          (onClick)="createConsultation()"
          [disabled]="!selectedAptForConsult"></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.25rem;
      h1 { margin: 0; font-size: 1.5rem; }
      .subtitle { color: var(--gray-500); margin-top: 0.25rem; }
    }
    .header-actions { display: flex; gap: 0.5rem; }

    .split-layout {
      display: grid; grid-template-columns: 360px 1fr; gap: 1.25rem;
      @media (max-width: 1024px) { grid-template-columns: 1fr; }
    }

    /* List panel */
    .list-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.25rem 0;
      h2 { margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; }
    }
    .count-badge {
      background: var(--primary); color: white; border-radius: 12px;
      padding: 0.15rem 0.6rem; font-size: 0.8rem; font-weight: 600;
    }

    .search-box {
      position: relative; margin-bottom: 0.75rem;
      i { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--gray-400); font-size: 0.9rem; }
      .search-input { width: 100%; padding-left: 2.25rem; border-radius: 8px; }
    }

    .consult-list { max-height: calc(100vh - 320px); overflow-y: auto; }
    .consult-item {
      padding: 0.75rem; border-radius: 8px; cursor: pointer; margin-bottom: 0.25rem;
      border: 1px solid transparent; transition: all 0.15s;
      &:hover { background: var(--gray-50); }
      &.active { background: #EFF6FF; border-color: #BFDBFE; }
    }
    .consult-item-header {
      display: flex; justify-content: space-between; align-items: center;
      strong { font-size: 0.95rem; }
    }
    .consult-date { color: var(--gray-500); font-size: 0.75rem; }
    .diag-preview {
      font-size: 0.8rem; color: var(--gray-600); margin-top: 0.25rem;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .motif-chip {
      display: inline-block; margin-top: 0.3rem; padding: 0.1rem 0.5rem;
      background: var(--gray-100); border-radius: 4px; font-size: 0.7rem; color: var(--gray-600);
    }
    .empty-list {
      text-align: center; padding: 2rem; color: var(--gray-400);
      i { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    }

    /* Detail panel */
    .detail-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.25rem 0; flex-wrap: wrap; gap: 0.75rem;
    }
    .patient-badge {
      display: flex; align-items: center; gap: 0.75rem;
      h2 { margin: 0; font-size: 1.15rem; }
      small { color: var(--gray-500); }
    }
    .avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem;
    }
    .detail-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .form-sections { display: flex; flex-direction: column; gap: 1.25rem; padding: 0.5rem; }
    .form-section {
      .section-title {
        display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;
        padding-bottom: 0.4rem; border-bottom: 1px solid var(--gray-100);
        h3 { margin: 0; font-size: 1rem; color: var(--gray-800); }
        i { color: var(--primary); }
      }
    }
    .presc-count {
      background: var(--gray-200); border-radius: 10px; padding: 0.1rem 0.5rem;
      font-size: 0.75rem; font-weight: 600; color: var(--gray-600);
    }

    .w-full { width: 100%; }
    .mt-2 { margin-top: 0.5rem; }

    /* Prescriptions */
    .prescriptions-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .prescription-card {
      background: var(--gray-50); border-left: 3px solid var(--primary);
      border-radius: 8px; padding: 0.75rem 1rem;
    }
    .presc-main {
      display: flex; align-items: center; gap: 0.6rem;
      .presc-icon { color: var(--primary); }
      .presc-info { display: flex; flex-direction: column; }
      strong { font-size: 0.95rem; color: var(--primary); }
      .presc-dosage { font-size: 0.85rem; color: var(--gray-600); }
    }
    .presc-details {
      display: flex; gap: 1rem; margin-top: 0.4rem;
      span { font-size: 0.8rem; color: var(--gray-500); display: flex; align-items: center; gap: 0.3rem; }
    }
    .presc-instructions {
      margin-top: 0.35rem; font-size: 0.8rem; color: var(--gray-600);
      font-style: italic; display: flex; align-items: center; gap: 0.3rem;
    }

    .add-presc-form {
      background: var(--gray-50); border-radius: 10px; padding: 1rem;
      h4 { margin: 0 0 0.75rem; font-size: 0.95rem; color: var(--gray-700); }
    }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.5rem; }
    .form-group { margin-bottom: 0.5rem; }
    .form-group label { display: block; font-weight: 500; color: #334155; margin-bottom: 0.3rem; font-size: 0.85rem; }
    :host ::ng-deep .form-grid-2 .p-inputnumber { width: 100%; }
    :host ::ng-deep .form-grid-2 .p-inputnumber-input { width: 100%; }
    .add-presc-actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; }

    .empty-detail {
      text-align: center; padding: 4rem 2rem; color: var(--gray-400);
      i { font-size: 4rem; display: block; margin-bottom: 1rem; color: var(--gray-300); }
      h3 { margin: 0 0 0.5rem; color: var(--gray-500); font-size: 1.1rem; }
      p { font-size: 0.9rem; }
    }

    /* New consult dialog */
    .dialog-desc { color: var(--gray-500); margin: 0 0 1rem; font-size: 0.9rem; }
    .no-rdv {
      text-align: center; padding: 2rem; color: var(--gray-400);
      i { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    }
    .rdv-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .rdv-option {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: 0.85rem; border: 1px solid var(--gray-200); border-radius: 10px;
      cursor: pointer; transition: all 0.15s;
      &:hover { border-color: #93C5FD; background: #F8FAFF; }
      &.selected { border-color: var(--primary); background: #EFF6FF; }
    }
    .rdv-radio { padding-top: 0.15rem; }
    .radio-dot {
      display: block; width: 18px; height: 18px; border-radius: 50%;
      border: 2px solid var(--gray-300); transition: all 0.15s;
      &.active { border-color: var(--primary); background: var(--primary);
        box-shadow: inset 0 0 0 3px white;
      }
    }
    .rdv-info {
      flex: 1;
      strong { font-size: 0.95rem; display: block; margin-bottom: 0.3rem; }
    }
    .rdv-meta {
      display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;
      span { font-size: 0.8rem; color: var(--gray-500); display: flex; align-items: center; gap: 0.3rem; }
    }
  `]
})
export class MedecinConsultationsComponent implements OnInit {
  consultations: Consultation[] = [];
  selectedConsult: Consultation | null = null;
  newPrescription: Partial<Prescription> = this.emptyPrescription();
  searchText = '';

  // New consultation dialog
  showNewConsultDialog = false;
  confirmingAppointments: Appointment[] = [];
  selectedAptForConsult: number | null = null;

  constructor(
    private consultationService: ConsultationService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  get filteredConsultations(): Consultation[] {
    if (!this.searchText.trim()) return this.consultations;
    const q = this.searchText.toLowerCase();
    return this.consultations.filter(c =>
      c.patientNom?.toLowerCase().includes(q) ||
      c.diagnostic?.toLowerCase().includes(q) ||
      c.motif?.toLowerCase().includes(q)
    );
  }

  emptyPrescription(): Partial<Prescription> {
    return { medicament: '', dosage: '', frequence: '', dureeJours: 7, instructions: '', renouvellementAutorise: false };
  }

  loadConsultations(): void {
    this.consultationService.getMedecinConsultations().subscribe({
      next: (data) => {
        this.consultations = data;
        if (this.selectedConsult) {
          const updated = data.find(c => c.id === this.selectedConsult!.id);
          if (updated) this.selectedConsult = { ...updated };
        }
      }
    });
  }

  onSelectConsultation(consult: Consultation): void {
    this.selectedConsult = { ...consult, prescriptions: [...(consult.prescriptions || [])] };
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
  }

  // ===== New consultation =====
  openNewConsultDialog(): void {
    this.selectedAptForConsult = null;
    this.appointmentService.getMedecinAppointments().subscribe({
      next: (data) => {
        this.confirmingAppointments = data.filter(a => a.statut === 'CONFIRME');
        this.showNewConsultDialog = true;
      }
    });
  }

  createConsultation(): void {
    if (!this.selectedAptForConsult) return;
    this.consultationService.createConsultation(this.selectedAptForConsult, {}).subscribe({
      next: (consult) => {
        this.messageService.add({ severity: 'success', summary: 'Consultation créée' });
        this.showNewConsultDialog = false;
        this.loadConsultations();
        this.selectedConsult = { ...consult, prescriptions: consult.prescriptions || [] };
      },
      error: (err) => {
        const msg = err.error?.message || err.error || 'Erreur';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: typeof msg === 'string' ? msg : 'Impossible de créer la consultation' });
      }
    });
  }

  // ===== Save =====
  saveConsultation(): void {
    if (!this.selectedConsult) return;
    this.consultationService.updateConsultation(this.selectedConsult.id, this.selectedConsult).subscribe({
      next: (updated) => {
        this.selectedConsult = { ...updated, prescriptions: updated.prescriptions || [] };
        this.loadConsultations();
        this.messageService.add({ severity: 'success', summary: 'Consultation enregistrée' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d\'enregistrer' })
    });
  }

  // ===== Prescriptions =====
  addPrescription(): void {
    if (!this.selectedConsult || !this.newPrescription.medicament?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Médicament requis' });
      return;
    }
    const prescription: Prescription = {
      ...this.newPrescription as Prescription,
      patientId: this.selectedConsult.patientId,
      medecinId: this.selectedConsult.medecinId,
      dateDebut: new Date().toISOString().split('T')[0]
    };
    this.consultationService.addPrescription(this.selectedConsult.id, prescription).subscribe({
      next: (presc) => {
        this.selectedConsult!.prescriptions = this.selectedConsult!.prescriptions || [];
        this.selectedConsult!.prescriptions.push(presc);
        this.newPrescription = this.emptyPrescription();
        this.messageService.add({ severity: 'success', summary: 'Prescription ajoutée' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur' })
    });
  }

  // ===== PDF =====
  generatePrescriptionPdf(): void {
    if (!this.selectedConsult || !this.selectedConsult.prescriptions?.length) return;
    const user = this.authService.user();

    const doc = new jsPDF();

    // Header
    doc.setFillColor(30, 111, 217);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Ordonnance Médicale', 14, 20);
    doc.setFontSize(11);
    doc.text('MediSync - Plateforme médicale', 14, 30);

    // Doctor & patient info
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(12);
    doc.text(`Médecin: Dr. ${user?.prenom ?? ''} ${user?.nom ?? ''}`, 14, 52);
    doc.text(`Patient: ${this.selectedConsult.patientNom}`, 14, 60);
    doc.text(`Date: ${this.formatDate(new Date().toISOString())}`, 14, 68);

    if (this.selectedConsult.diagnostic) {
      doc.setFontSize(10);
      doc.text(`Diagnostic: ${this.selectedConsult.diagnostic}`, 14, 78);
    }

    // Table
    autoTable(doc, {
      startY: this.selectedConsult.diagnostic ? 85 : 78,
      head: [['Médicament', 'Dosage', 'Fréquence', 'Durée', 'Instructions']],
      body: this.selectedConsult.prescriptions.map(p => [
        p.medicament, p.dosage, p.frequence,
        `${p.dureeJours} jours`, p.instructions || '—'
      ]),
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [30, 111, 217], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 120;

    // Recommendations
    if (this.selectedConsult.recommandations) {
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text('Recommandations:', 14, finalY + 15);
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(this.selectedConsult.recommandations, 180);
      doc.text(lines, 14, finalY + 22);
    }

    // Signature
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Signature et cachet du médecin:', 120, finalY + 45);
    doc.line(120, finalY + 65, 190, finalY + 65);

    // Footer
    doc.setFontSize(8);
    doc.text('Document généré via MediSync', 14, 285);

    const fileName = `ordonnance-${this.selectedConsult.patientNom?.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    doc.save(fileName);
    this.messageService.add({ severity: 'success', summary: 'PDF généré', detail: fileName });
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return new Intl.DateTimeFormat('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
  }

  motifLabel(m: string): string {
    const map: Record<string, string> = {
      CONSULTATION_GENERALE: 'Consultation', SUIVI: 'Suivi', URGENCE: 'Urgence',
      VACCINATION: 'Vaccination', CERTIFICAT_MEDICAL: 'Certificat', AUTRE: 'Autre'
    };
    return map[m] ?? m;
  }

  motifSeverity(m: string): 'info' | 'warning' | 'danger' {
    if (m === 'URGENCE') return 'danger';
    if (m === 'SUIVI') return 'warning';
    return 'info';
  }
}
