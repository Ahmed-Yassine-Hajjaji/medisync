import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConsultationService } from '../../../core/services/consultation.service';
import { PatientService } from '../../../core/services/patient.service';
import { Consultation, Prescription } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-medecin-consultations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Consultations</h1>
        <p>Gerer les dossiers patients et prescriptions</p>
      </div>

      <div class="content-grid">
        <div class="card">
          <h2>Historique des consultations</h2>
          @for (consult of consultations; track consult.id) {
            <div class="consult-item" (click)="selectConsultation(consult)" [class.selected]="selectedConsult?.id === consult.id">
              <div class="consult-info">
                <strong>{{ consult.patientNom }}</strong>
                <span>{{ consult.dateConsultation | date:'dd/MM/yyyy' }}</span>
              </div>
              @if (consult.diagnostic) {
                <p class="diagnostic">{{ consult.diagnostic }}</p>
              }
            </div>
          } @empty {
            <p class="empty-state">Aucune consultation</p>
          }
        </div>

        <div class="card">
          @if (selectedConsult) {
            <h2>Detail de la consultation</h2>

            <div class="form-group">
              <label>Motif</label>
              <input type="text" [(ngModel)]="selectedConsult.motif">
            </div>

            <div class="form-group">
              <label>Symptomes</label>
              <textarea [(ngModel)]="selectedConsult.symptomes" rows="2"></textarea>
            </div>

            <div class="form-group">
              <label>Diagnostic</label>
              <textarea [(ngModel)]="selectedConsult.diagnostic" rows="2"></textarea>
            </div>

            <div class="form-group">
              <label>Compte rendu</label>
              <textarea [(ngModel)]="selectedConsult.compteRendu" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Recommandations</label>
              <textarea [(ngModel)]="selectedConsult.recommandations" rows="2"></textarea>
            </div>

            <button class="btn btn-primary" (click)="updateConsultation()">Enregistrer</button>

            <hr>

            <h3>Prescriptions</h3>
            @for (presc of selectedConsult.prescriptions; track presc.id) {
              <div class="prescription-item">
                <strong>{{ presc.medicament }}</strong> - {{ presc.dosage }}
                <span>{{ presc.frequence }} pendant {{ presc.dureeJours }} jours</span>
              </div>
            }

            <h4>Ajouter une prescription</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Medicament</label>
                <input type="text" [(ngModel)]="newPrescription.medicament">
              </div>
              <div class="form-group">
                <label>Dosage</label>
                <input type="text" [(ngModel)]="newPrescription.dosage">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Frequence</label>
                <input type="text" [(ngModel)]="newPrescription.frequence" placeholder="ex: 3 fois par jour">
              </div>
              <div class="form-group">
                <label>Duree (jours)</label>
                <input type="number" [(ngModel)]="newPrescription.dureeJours">
              </div>
            </div>
            <div class="form-group">
              <label>Instructions</label>
              <textarea [(ngModel)]="newPrescription.instructions" rows="2"></textarea>
            </div>
            <button class="btn btn-secondary" (click)="addPrescription()">Ajouter prescription</button>
          } @else {
            <p class="empty-state">Selectionnez une consultation</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    h2 { margin-bottom: 1rem; }
    h3 { margin: 1.5rem 0 1rem; }
    h4 { margin: 1rem 0 0.5rem; font-size: 0.875rem; color: var(--gray-600); }
    hr { margin: 1.5rem 0; border: none; border-top: 1px solid var(--gray-200); }

    .consult-item {
      padding: 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      margin-bottom: 0.5rem;
      border: 1px solid var(--gray-200);

      &:hover { background: var(--gray-50); }
      &.selected { border-color: var(--primary); background: #eff6ff; }

      strong { display: block; }
      span { font-size: 0.75rem; color: var(--gray-500); }
      .diagnostic { font-size: 0.875rem; color: var(--gray-600); margin-top: 0.25rem; }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .prescription-item {
      padding: 0.5rem;
      background: var(--gray-50);
      border-radius: 0.375rem;
      margin-bottom: 0.5rem;

      strong { color: var(--primary); }
      span { display: block; font-size: 0.75rem; color: var(--gray-500); }
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--gray-500);
    }
  `]
})
export class MedecinConsultationsComponent implements OnInit {
  consultations: Consultation[] = [];
  selectedConsult: Consultation | null = null;
  newPrescription: Partial<Prescription> = {
    medicament: '',
    dosage: '',
    frequence: '',
    dureeJours: 7,
    instructions: '',
    renouvellementAutorise: false
  };

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultationService
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.consultationService.getMedecinConsultations().subscribe({
      next: (data) => this.consultations = data
    });
  }

  selectConsultation(consult: Consultation): void {
    this.selectedConsult = { ...consult };
  }

  updateConsultation(): void {
    if (!this.selectedConsult) return;
    this.consultationService.updateConsultation(this.selectedConsult.id, this.selectedConsult).subscribe({
      next: (updated) => {
        this.selectedConsult = updated;
        this.loadConsultations();
      }
    });
  }

  addPrescription(): void {
    if (!this.selectedConsult || !this.newPrescription.medicament) return;

    const prescription: Prescription = {
      ...this.newPrescription as Prescription,
      patientId: this.selectedConsult.patientId,
      medecinId: this.selectedConsult.medecinId,
      dateDebut: new Date().toISOString().split('T')[0]
    };

    this.consultationService.addPrescription(this.selectedConsult.id, prescription).subscribe({
      next: (presc) => {
        this.selectedConsult!.prescriptions.push(presc);
        this.newPrescription = {
          medicament: '',
          dosage: '',
          frequence: '',
          dureeJours: 7,
          instructions: '',
          renouvellementAutorise: false
        };
      }
    });
  }
}
