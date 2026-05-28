import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Prescription } from '../../../core/models/consultation.model';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="prescriptions-page">
      <header class="page-header">
        <h1>Mes ordonnances</h1>
        <p>Consultez et telechargez vos ordonnances</p>
      </header>

      <div class="filters">
        <button
          class="filter-btn"
          [class.active]="filter === 'all'"
          (click)="filter = 'all'">
          Toutes
        </button>
        <button
          class="filter-btn"
          [class.active]="filter === 'active'"
          (click)="filter = 'active'">
          En cours
        </button>
        <button
          class="filter-btn"
          [class.active]="filter === 'expired'"
          (click)="filter = 'expired'">
          Terminees
        </button>
      </div>

      @if (isLoading) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
      } @else if (filteredPrescriptions.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
              <path d="m8.5 8.5 7 7"/>
            </svg>
          </div>
          <h3>Aucune ordonnance</h3>
          <p>Vos ordonnances medicales apparaitront ici apres vos consultations.</p>
        </div>
      } @else {
        <div class="prescriptions-list">
          @for (prescription of filteredPrescriptions; track prescription.id) {
            <div class="prescription-card" [class.active]="isActive(prescription)">
              <div class="card-status">
                <span class="status-badge" [class.active]="isActive(prescription)">
                  @if (isActive(prescription)) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  }
                  {{ isActive(prescription) ? 'En cours' : 'Terminee' }}
                </span>
              </div>

              <div class="card-content">
                <div class="medication-info">
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                      <path d="m8.5 8.5 7 7"/>
                    </svg>
                    {{ prescription.medicament }}
                  </h3>
                  <p class="dosage">{{ prescription.dosage }}</p>
                  <p class="frequency">{{ prescription.frequence }}</p>
                </div>

                <div class="details">
                  <div class="detail-row">
                    <span class="label">Medecin</span>
                    <span class="value">Dr. {{ prescription.medecinNom }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Duree</span>
                    <span class="value">{{ prescription.dureeJours }} jours</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Debut</span>
                    <span class="value">{{ formatDate(prescription.dateDebut) }}</span>
                  </div>
                  @if (prescription.dateFin) {
                    <div class="detail-row">
                      <span class="label">Fin</span>
                      <span class="value">{{ formatDate(prescription.dateFin) }}</span>
                    </div>
                  }
                  @if (prescription.renouvellementAutorise) {
                    <div class="detail-row">
                      <span class="label">Renouvellements</span>
                      <span class="value">{{ prescription.nombreRenouvellements || 0 }} autorises</span>
                    </div>
                  }
                </div>

                @if (prescription.instructions) {
                  <div class="instructions">
                    <span class="label">Instructions</span>
                    <p>{{ prescription.instructions }}</p>
                  </div>
                }
              </div>

              <div class="card-actions">
                <button class="download-btn" (click)="downloadPdf(prescription)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Telecharger PDF
                </button>
                @if (prescription.renouvellementAutorise && isActive(prescription)) {
                  <button class="renew-btn" (click)="requestRenewal(prescription)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M8 16H3v5"/>
                    </svg>
                    Renouveler
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .prescriptions-page {
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;

      h1 {
        margin: 0 0 0.5rem 0;
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--gray-900);
      }

      p {
        margin: 0;
        color: var(--gray-500);
      }
    }

    .filters {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .filter-btn {
      padding: 0.625rem 1.25rem;
      border: 1px solid var(--gray-200);
      background: var(--white);
      border-radius: var(--radius-full);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      color: var(--gray-600);
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
      }

      &.active {
        background: var(--primary);
        border-color: var(--primary);
        color: white;
      }
    }

    .loading {
      text-align: center;
      padding: 4rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);

      .empty-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 1.5rem;
        background: var(--primary-light);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
      }

      h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--gray-900);
      }

      p {
        margin: 0;
        color: var(--gray-500);
        max-width: 400px;
        margin: 0 auto;
        line-height: 1.5;
      }
    }

    .prescriptions-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .prescription-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      border-left: 3px solid var(--gray-400);

      &.active {
        border-left-color: var(--success);
      }
    }

    .card-status {
      padding: 0.75rem 1.25rem;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-100);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--gray-200);
      color: var(--gray-600);

      &.active {
        background: #DCFCE7;
        color: #16A34A;
      }
    }

    .card-content {
      padding: 1.25rem;
    }

    .medication-info {
      margin-bottom: 1.25rem;

      h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
        color: var(--gray-900);

        svg {
          color: var(--primary);
        }
      }

      .dosage {
        margin: 0;
        font-size: 1rem;
        color: var(--gray-700);
      }

      .frequency {
        margin: 0.25rem 0 0 0;
        color: var(--gray-500);
        font-size: 0.9375rem;
      }
    }

    .details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      padding: 1rem;
      background: var(--gray-50);
      border-radius: var(--radius-md);
    }

    .detail-row {
      display: flex;
      flex-direction: column;

      .label {
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--gray-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .value {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--gray-900);
        margin-top: 0.25rem;
      }
    }

    .instructions {
      margin-top: 1rem;
      padding: 0.875rem;
      background: #FEF3C7;
      border-radius: var(--radius-md);
      border-left: 3px solid #F59E0B;

      .label {
        font-size: 0.6875rem;
        font-weight: 600;
        color: #D97706;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: block;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-style: italic;
        color: var(--gray-700);
        font-size: 0.9375rem;
      }
    }

    .card-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--gray-50);
      border-top: 1px solid var(--gray-100);
    }

    .download-btn, .renew-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      transition: all 0.2s;
    }

    .download-btn {
      background: var(--primary);
      color: white;

      &:hover {
        background: var(--primary-dark);
      }
    }

    .renew-btn {
      background: var(--success);
      color: white;

      &:hover {
        background: #15803D;
      }
    }

    @media (max-width: 640px) {
      .filters {
        flex-wrap: wrap;
      }

      .card-actions {
        flex-direction: column;
      }

      .download-btn, .renew-btn {
        justify-content: center;
      }
    }
  `]
})
export class PrescriptionsComponent implements OnInit {
  prescriptions: Prescription[] = [];
  isLoading = true;
  filter: 'all' | 'active' | 'expired' = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  get filteredPrescriptions(): Prescription[] {
    if (this.filter === 'all') return this.prescriptions;
    if (this.filter === 'active') return this.prescriptions.filter(p => this.isActive(p));
    return this.prescriptions.filter(p => !this.isActive(p));
  }

  loadPrescriptions(): void {
    this.isLoading = true;
    this.http.get<Prescription[]>(`${environment.apiUrl}/patient/prescriptions`)
      .subscribe({
        next: (data) => {
          this.prescriptions = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  isActive(prescription: Prescription): boolean {
    if (!prescription.dateFin) return true;
    return new Date(prescription.dateFin) > new Date();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  downloadPdf(prescription: Prescription): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDONNANCE MEDICALE', pageWidth / 2, 30, { align: 'center' });

    // Line separator
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(20, 40, pageWidth - 20, 40);

    // Doctor info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dr. ${prescription.medecinNom || 'N/A'}`, 20, 55);
    doc.text(`Date: ${this.formatDate(prescription.dateDebut)}`, 20, 65);

    // Patient info
    doc.text(`Patient: ${prescription.patientNom || 'N/A'}`, 20, 80);

    // Line separator
    doc.line(20, 90, pageWidth - 20, 90);

    // Prescription box
    doc.setDrawColor(100);
    doc.setLineWidth(0.3);
    doc.roundedRect(20, 100, pageWidth - 40, 80, 3, 3);

    // Medication details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(prescription.medicament, 30, 115);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dosage: ${prescription.dosage}`, 30, 130);
    doc.text(`Frequence: ${prescription.frequence}`, 30, 145);
    doc.text(`Duree: ${prescription.dureeJours} jours`, 30, 160);

    if (prescription.instructions) {
      doc.text(`Instructions: ${prescription.instructions}`, 30, 175);
    }

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Signature du medecin', pageWidth - 60, 250);

    // Validity info
    if (prescription.renouvellementAutorise) {
      doc.text(`Renouvellements autorises: ${prescription.nombreRenouvellements || 0}`, 20, 250);
    }

    // Download
    const filename = `ordonnance_${prescription.medicament.replace(/\s+/g, '_')}_${prescription.dateDebut}.pdf`;
    doc.save(filename);
  }

  requestRenewal(prescription: Prescription): void {
    if (confirm('Demander le renouvellement de cette ordonnance?')) {
      this.http.post(`${environment.apiUrl}/patient/prescriptions/${prescription.id}/renewal`, {})
        .subscribe({
          next: () => {
            alert('Demande de renouvellement envoyee au medecin');
          },
          error: () => {
            alert('Erreur lors de la demande');
          }
        });
    }
  }
}
