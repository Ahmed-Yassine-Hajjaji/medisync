import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../../core/services/consultation.service';
import { Consultation } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-patient-consultations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Mon dossier medical</h1>
        <p>Historique de vos consultations et prescriptions</p>
      </div>

      <div class="consultations-list">
        @for (consult of consultations; track consult.id) {
          <div class="consultation-card card">
            <div class="consultation-header">
              <div>
                <h3>{{ consult.medecinNom }}</h3>
                <span class="date">{{ consult.dateConsultation | date:'dd MMMM yyyy' }}</span>
              </div>
            </div>

            @if (consult.motif) {
              <div class="section">
                <h4>Motif</h4>
                <p>{{ consult.motif }}</p>
              </div>
            }

            @if (consult.symptomes) {
              <div class="section">
                <h4>Symptomes</h4>
                <p>{{ consult.symptomes }}</p>
              </div>
            }

            @if (consult.diagnostic) {
              <div class="section">
                <h4>Diagnostic</h4>
                <p>{{ consult.diagnostic }}</p>
              </div>
            }

            @if (consult.compteRendu) {
              <div class="section">
                <h4>Compte rendu</h4>
                <p>{{ consult.compteRendu }}</p>
              </div>
            }

            @if (consult.prescriptions && consult.prescriptions.length > 0) {
              <div class="section">
                <h4>Prescriptions</h4>
                <div class="prescriptions">
                  @for (presc of consult.prescriptions; track presc.id) {
                    <div class="prescription-item">
                      <strong>{{ presc.medicament }}</strong>
                      <span>{{ presc.dosage }} - {{ presc.frequence }}</span>
                      <span class="duration">{{ presc.dureeJours }} jours</span>
                      @if (presc.instructions) {
                        <p class="instructions">{{ presc.instructions }}</p>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        } @empty {
          <div class="card empty-state">
            <p>Aucune consultation enregistree</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .consultations-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .consultation-card {
      .consultation-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--gray-200);

        h3 {
          font-size: 1.125rem;
        }

        .date {
          color: var(--gray-500);
          font-size: 0.875rem;
        }
      }

      .section {
        margin-bottom: 1rem;

        h4 {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 0.25rem;
        }

        p {
          color: var(--gray-700);
        }
      }

      .prescriptions {
        background: var(--gray-50);
        border-radius: 0.5rem;
        padding: 1rem;
      }

      .prescription-item {
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--gray-200);

        &:last-child {
          border-bottom: none;
        }

        strong {
          display: block;
          color: var(--primary);
        }

        span {
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        .duration {
          margin-left: 0.5rem;
          padding: 0.125rem 0.5rem;
          background: var(--gray-200);
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }

        .instructions {
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
          font-style: italic;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--gray-500);
    }
  `]
})
export class PatientConsultationsComponent implements OnInit {
  consultations: Consultation[] = [];

  constructor(private consultationService: ConsultationService) {}

  ngOnInit(): void {
    this.consultationService.getPatientConsultations().subscribe({
      next: (data) => this.consultations = data
    });
  }
}
