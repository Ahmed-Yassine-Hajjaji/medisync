import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ConsultationService } from '../../../core/services/consultation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Consultation, Prescription } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-medecin-consultations',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ListboxModule, ButtonModule, InputTextModule, InputTextareaModule,
    DividerModule, TagModule, ToastModule, CheckboxModule, InputNumberModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <header class="page-header">
      <div>
        <h1>Consultations</h1>
        <p>Gérer les dossiers patients et prescriptions</p>
      </div>
    </header>

    <div class="split-layout">
      <!-- Liste des consultations -->
      <p-card styleClass="list-card">
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2><i class="pi pi-list"></i> Historique</h2>
          </div>
        </ng-template>

        <p-listbox
          [options]="consultations"
          [(ngModel)]="selectedConsult"
          (onChange)="onSelectConsultation($event.value)"
          [filter]="true"
          filterPlaceHolder="Rechercher un patient..."
          [listStyle]="{'max-height': '600px'}"
          optionLabel="patientNom"
          dataKey="id"
          [emptyMessage]="'Aucune consultation'">
          <ng-template let-item pTemplate="item">
            <div class="consult-item">
              <div class="consult-header">
                <strong>{{ item.patientNom }}</strong>
                <small>{{ formatDate(item.dateConsultation) }}</small>
              </div>
              @if (item.diagnostic) {
                <p class="diag-preview">{{ item.diagnostic }}</p>
              }
            </div>
          </ng-template>
        </p-listbox>
      </p-card>

      <!-- Détail / Formulaire -->
      <div class="detail-pane">
        @if (selectedConsult) {
          <p-card>
            <ng-template pTemplate="header">
              <div class="card-header">
                <div>
                  <h2><i class="pi pi-user"></i> {{ selectedConsult.patientNom }}</h2>
                  <small>Consultation du {{ formatDate(selectedConsult.dateConsultation) }}</small>
                </div>
                <div class="header-actions">
                  <p-button
                    label="Générer ordonnance PDF"
                    icon="pi pi-file-pdf"
                    styleClass="p-button-secondary"
                    (onClick)="generatePrescriptionPdf()"
                    [disabled]="!selectedConsult.prescriptions?.length"></p-button>
                  <p-button
                    label="Enregistrer"
                    icon="pi pi-save"
                    (onClick)="saveConsultation()"></p-button>
                </div>
              </div>
            </ng-template>

            <div class="sections">
              <!-- Motif -->
              <section class="form-section">
                <h3><i class="pi pi-bookmark"></i> Motif de consultation</h3>
                <input pInputText [(ngModel)]="selectedConsult.motif" placeholder="Motif" class="w-full" />
              </section>

              <!-- Examen clinique -->
              <section class="form-section">
                <h3><i class="pi pi-search"></i> Examen clinique</h3>
                <textarea
                  pInputTextarea
                  [(ngModel)]="selectedConsult.symptomes"
                  rows="3"
                  placeholder="Symptômes, signes vitaux, examen physique..."
                  class="w-full"></textarea>
              </section>

              <!-- Diagnostic -->
              <section class="form-section">
                <h3><i class="pi pi-check-circle"></i> Diagnostic</h3>
                <textarea
                  pInputTextarea
                  [(ngModel)]="selectedConsult.diagnostic"
                  rows="3"
                  placeholder="Diagnostic principal et différentiels"
                  class="w-full"></textarea>
                <textarea
                  pInputTextarea
                  [(ngModel)]="selectedConsult.compteRendu"
                  rows="3"
                  placeholder="Compte rendu détaillé"
                  class="w-full mt-2"></textarea>
              </section>

              <!-- Traitement / Prescription -->
              <section class="form-section">
                <h3><i class="pi pi-heart"></i> Traitement / Prescription</h3>
                <textarea
                  pInputTextarea
                  [(ngModel)]="selectedConsult.recommandations"
                  rows="2"
                  placeholder="Recommandations générales"
                  class="w-full"></textarea>

                <p-divider></p-divider>

                <h4>Prescriptions ({{ selectedConsult.prescriptions?.length ?? 0 }})</h4>
                @for (presc of selectedConsult.prescriptions; track presc.id) {
                  <div class="prescription">
                    <div>
                      <strong>{{ presc.medicament }}</strong>
                      <span> — {{ presc.dosage }}</span>
                    </div>
                    <small>{{ presc.frequence }} pendant {{ presc.dureeJours }} jours</small>
                  </div>
                }

                <div class="add-prescription">
                  <h4>Ajouter un médicament</h4>
                  <div class="form-row">
                    <input pInputText [(ngModel)]="newPrescription.medicament" placeholder="Médicament" />
                    <input pInputText [(ngModel)]="newPrescription.dosage" placeholder="Dosage (ex: 500 mg)" />
                  </div>
                  <div class="form-row">
                    <input pInputText [(ngModel)]="newPrescription.frequence" placeholder="Fréquence (ex: 3x/jour)" />
                    <p-inputNumber
                      [(ngModel)]="newPrescription.dureeJours"
                      [min]="1"
                      [showButtons]="true"
                      placeholder="Durée (jours)"
                      styleClass="w-full"></p-inputNumber>
                  </div>
                  <textarea pInputTextarea [(ngModel)]="newPrescription.instructions" rows="2" placeholder="Instructions" class="w-full"></textarea>
                  <div class="presc-actions">
                    <p-button label="Ajouter prescription" icon="pi pi-plus" styleClass="p-button-secondary" (onClick)="addPrescription()"></p-button>
                  </div>
                </div>
              </section>
            </div>
          </p-card>
        } @else {
          <p-card>
            <div class="empty-detail">
              <i class="pi pi-file" style="font-size: 3rem; color: var(--gray-300)"></i>
              <p>Sélectionnez une consultation pour afficher les détails</p>
            </div>
          </p-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.25rem;
      h1 { margin: 0; font-size: 1.5rem; }
      p { color: var(--gray-500); margin-top: 0.25rem; }
    }

    .split-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.25rem;
      @media (max-width: 1024px) { grid-template-columns: 1fr; }
    }

    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem 0;
      h2 { margin: 0; font-size: 1.125rem; display: flex; align-items: center; gap: 0.5rem; }
      small { color: var(--gray-500); }
    }
    .header-actions { display: flex; gap: 0.5rem; }

    .consult-item { padding: 0.4rem 0; width: 100%; }
    .consult-header {
      display: flex; justify-content: space-between; align-items: center;
      gap: 0.5rem;
      small { color: var(--gray-500); font-size: 0.75rem; }
    }
    .diag-preview {
      font-size: 0.8rem; color: var(--gray-600); margin-top: 0.25rem;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    .sections { display: flex; flex-direction: column; gap: 1.25rem; padding: 0.5rem; }
    .form-section h3 {
      font-size: 1rem; margin-bottom: 0.6rem; color: var(--gray-800);
      display: flex; align-items: center; gap: 0.5rem;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid var(--gray-100);
    }
    .form-section h4 { font-size: 0.875rem; margin: 0.75rem 0 0.5rem; color: var(--gray-700); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem; }
    :host ::ng-deep .form-row .p-inputnumber { width: 100%; }
    :host ::ng-deep .form-row .p-inputnumber-input { width: 100%; }
    .w-full { width: 100%; }
    .mt-2 { margin-top: 0.5rem; }

    .prescription {
      padding: 0.65rem 0.75rem;
      background: var(--gray-50);
      border-left: 3px solid var(--primary);
      border-radius: 4px;
      margin-bottom: 0.4rem;
      strong { color: var(--primary); }
      small { display: block; color: var(--gray-500); margin-top: 0.25rem; }
    }

    .add-prescription {
      margin-top: 0.75rem;
      padding: 0.85rem;
      background: var(--gray-50);
      border-radius: 0.5rem;
    }
    .presc-actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; }

    .empty-detail {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--gray-500);
      p { margin-top: 1rem; }
    }
  `]
})
export class MedecinConsultationsComponent implements OnInit {
  consultations: Consultation[] = [];
  selectedConsult: Consultation | null = null;
  newPrescription: Partial<Prescription> = this.emptyPrescription();

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultationService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  emptyPrescription(): Partial<Prescription> {
    return {
      medicament: '',
      dosage: '',
      frequence: '',
      dureeJours: 7,
      instructions: '',
      renouvellementAutorise: false
    };
  }

  loadConsultations(): void {
    this.consultationService.getMedecinConsultations().subscribe({
      next: (data) => this.consultations = data
    });
  }

  onSelectConsultation(consult: Consultation | null): void {
    this.selectedConsult = consult ? { ...consult } : null;
  }

  saveConsultation(): void {
    if (!this.selectedConsult) return;
    this.consultationService.updateConsultation(this.selectedConsult.id, this.selectedConsult).subscribe({
      next: (updated) => {
        this.selectedConsult = updated;
        this.loadConsultations();
        this.messageService.add({ severity: 'success', summary: 'Consultation enregistrée' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d\'enregistrer' })
    });
  }

  addPrescription(): void {
    if (!this.selectedConsult || !this.newPrescription.medicament) {
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
      }
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return new Intl.DateTimeFormat('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
  }

  generatePrescriptionPdf(): void {
    if (!this.selectedConsult || !this.selectedConsult.prescriptions?.length) return;
    const user = this.authService.user();

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Ordonnance médicale', 14, 20);

    doc.setFontSize(11);
    doc.text(`Médecin: Dr. ${user?.prenom ?? ''} ${user?.nom ?? ''}`, 14, 32);
    doc.text(`Patient: ${this.selectedConsult.patientNom}`, 14, 39);
    doc.text(`Date: ${this.formatDate(new Date().toISOString())}`, 14, 46);

    autoTable(doc, {
      startY: 55,
      head: [['Médicament', 'Dosage', 'Fréquence', 'Durée', 'Instructions']],
      body: this.selectedConsult.prescriptions.map(p => [
        p.medicament,
        p.dosage,
        p.frequence,
        `${p.dureeJours} jours`,
        p.instructions || '—'
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 111, 217] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.text('Signature et cachet du médecin', 14, finalY + 25);

    doc.save(`ordonnance-${this.selectedConsult.patientNom}-${Date.now()}.pdf`);
    this.messageService.add({ severity: 'success', summary: 'PDF généré' });
  }
}
