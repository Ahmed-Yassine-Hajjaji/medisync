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
          <span class="icon">&#128203;</span>
          <p>Aucune ordonnance</p>
        </div>
      } @else {
        <div class="prescriptions-list">
          @for (prescription of filteredPrescriptions; track prescription.id) {
            <div class="prescription-card" [class.active]="isActive(prescription)">
              <div class="card-status">
                <span class="status-badge" [class.active]="isActive(prescription)">
                  {{ isActive(prescription) ? 'En cours' : 'Terminee' }}
                </span>
              </div>

              <div class="card-content">
                <div class="medication-info">
                  <h3>&#128138; {{ prescription.medicament }}</h3>
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
                  &#128229; Telecharger PDF
                </button>
                @if (prescription.renouvellementAutorise && isActive(prescription)) {
                  <button class="renew-btn" (click)="requestRenewal(prescription)">
                    &#128260; Renouveler
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
      padding: 24px;
    }
    .page-header {
      margin-bottom: 32px;
    }
    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
    }
    .page-header p {
      margin: 0;
      color: #666;
    }
    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .filter-btn {
      padding: 10px 20px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    }
    .filter-btn:hover {
      border-color: #1976d2;
      color: #1976d2;
    }
    .filter-btn.active {
      background: #1976d2;
      border-color: #1976d2;
      color: white;
    }
    .loading {
      text-align: center;
      padding: 60px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top-color: #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .empty-state {
      text-align: center;
      padding: 60px;
      color: #666;
    }
    .empty-state .icon {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
    }
    .prescriptions-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .prescription-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      border-left: 4px solid #9e9e9e;
    }
    .prescription-card.active {
      border-left-color: #4caf50;
    }
    .card-status {
      padding: 12px 20px;
      background: #f5f5f5;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      background: #e0e0e0;
      color: #666;
    }
    .status-badge.active {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .card-content {
      padding: 20px;
    }
    .medication-info {
      margin-bottom: 20px;
    }
    .medication-info h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
    }
    .medication-info .dosage {
      margin: 0;
      font-size: 16px;
      color: #333;
    }
    .medication-info .frequency {
      margin: 4px 0 0 0;
      color: #666;
    }
    .details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
    }
    .detail-row {
      display: flex;
      flex-direction: column;
    }
    .detail-row .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    .detail-row .value {
      font-size: 14px;
      font-weight: 500;
      margin-top: 4px;
    }
    .instructions {
      margin-top: 16px;
      padding: 12px;
      background: #fff3e0;
      border-radius: 8px;
    }
    .instructions .label {
      font-size: 12px;
      color: #e65100;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }
    .instructions p {
      margin: 0;
      font-style: italic;
    }
    .card-actions {
      display: flex;
      gap: 12px;
      padding: 16px 20px;
      background: #f5f5f5;
      border-top: 1px solid #eee;
    }
    .download-btn, .renew-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
    }
    .download-btn {
      background: #1976d2;
      color: white;
    }
    .download-btn:hover {
      background: #1565c0;
    }
    .renew-btn {
      background: #4caf50;
      color: white;
    }
    .renew-btn:hover {
      background: #388e3c;
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
