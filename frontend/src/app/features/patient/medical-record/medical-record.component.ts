import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../../core/services/consultation.service';
import { Consultation } from '../../../core/models/consultation.model';
import { DocumentUploadComponent, UploadedDocument } from '../../../shared/components/document-upload/document-upload.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-medical-record',
  standalone: true,
  imports: [CommonModule, DocumentUploadComponent],
  template: `
    <div class="medical-record">
      <header class="page-header">
        <h1>Mon dossier medical</h1>
        <p>Consultez votre historique medical et vos documents</p>
      </header>

      <div class="tabs">
        <button
          class="tab"
          [class.active]="activeTab === 'consultations'"
          (click)="activeTab = 'consultations'">
          Consultations
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'documents'"
          (click)="activeTab = 'documents'">
          Documents
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'antecedents'"
          (click)="activeTab = 'antecedents'">
          Antecedents
        </button>
      </div>

      @if (isLoading) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
      } @else {
        @if (activeTab === 'consultations') {
          <div class="consultations-section">
            @if (consultations.length === 0) {
              <div class="empty-state">
                <span class="icon">&#128203;</span>
                <p>Aucune consultation enregistree</p>
              </div>
            } @else {
              @for (consultation of consultations; track consultation.id) {
                <div class="consultation-card">
                  <div class="card-header" (click)="toggleConsultation(consultation.id)">
                    <div class="header-info">
                      <div class="avatar">&#128104;&#8205;&#9877;&#65039;</div>
                      <div>
                        <h3>{{ consultation.medecinNom }}</h3>
                        <p class="date">{{ formatDate(consultation.dateConsultation) }}</p>
                      </div>
                    </div>
                    <span class="expand-icon" [class.expanded]="expandedId === consultation.id">
                      &#9660;
                    </span>
                  </div>

                  @if (expandedId === consultation.id) {
                    <div class="card-body">
                      @if (consultation.motif) {
                        <div class="info-row">
                          <label>Motif</label>
                          <p>{{ consultation.motif }}</p>
                        </div>
                      }
                      @if (consultation.symptomes) {
                        <div class="info-row">
                          <label>Symptomes</label>
                          <p>{{ consultation.symptomes }}</p>
                        </div>
                      }
                      @if (consultation.diagnostic) {
                        <div class="info-row">
                          <label>Diagnostic</label>
                          <p>{{ consultation.diagnostic }}</p>
                        </div>
                      }
                      @if (consultation.compteRendu) {
                        <div class="info-row">
                          <label>Compte rendu</label>
                          <p>{{ consultation.compteRendu }}</p>
                        </div>
                      }
                      @if (consultation.prescriptions && consultation.prescriptions.length > 0) {
                        <div class="prescriptions-section">
                          <h4>Prescriptions</h4>
                          @for (p of consultation.prescriptions; track p.id) {
                            <div class="prescription-item">
                              <strong>{{ p.medicament }}</strong>
                              <p>{{ p.dosage }} - {{ p.frequence }}</p>
                              <p class="duration">Duree: {{ p.dureeJours }} jours</p>
                              @if (p.instructions) {
                                <p class="instructions">{{ p.instructions }}</p>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        }

        @if (activeTab === 'documents') {
          <div class="documents-section">
            <h2>Telecharger un document</h2>
            <app-document-upload
              [uploadedDocuments]="documents"
              (uploaded)="onDocumentUploaded($event)"
              (deleted)="onDocumentDeleted($event)">
            </app-document-upload>
          </div>
        }

        @if (activeTab === 'antecedents') {
          <div class="antecedents-section">
            <div class="antecedent-card">
              <h3>&#128138; Allergies</h3>
              @if (antecedents.allergies.length > 0) {
                <ul>
                  @for (a of antecedents.allergies; track a) {
                    <li>{{ a }}</li>
                  }
                </ul>
              } @else {
                <p class="none">Aucune allergie declaree</p>
              }
            </div>

            <div class="antecedent-card">
              <h3>&#129656; Maladies chroniques</h3>
              @if (antecedents.maladiesChroniques.length > 0) {
                <ul>
                  @for (m of antecedents.maladiesChroniques; track m) {
                    <li>{{ m }}</li>
                  }
                </ul>
              } @else {
                <p class="none">Aucune maladie chronique</p>
              }
            </div>

            <div class="antecedent-card">
              <h3>&#128137; Antecedents chirurgicaux</h3>
              @if (antecedents.chirurgies.length > 0) {
                <ul>
                  @for (c of antecedents.chirurgies; track c) {
                    <li>{{ c }}</li>
                  }
                </ul>
              } @else {
                <p class="none">Aucun antecedent chirurgical</p>
              }
            </div>

            <div class="antecedent-card">
              <h3>&#128106; Antecedents familiaux</h3>
              @if (antecedents.familiaux.length > 0) {
                <ul>
                  @for (f of antecedents.familiaux; track f) {
                    <li>{{ f }}</li>
                  }
                </ul>
              } @else {
                <p class="none">Aucun antecedent familial declare</p>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .medical-record {
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
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 0;
    }
    .tab {
      padding: 12px 24px;
      border: none;
      background: none;
      font-size: 16px;
      cursor: pointer;
      color: #666;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.3s;
    }
    .tab:hover {
      color: #1976d2;
    }
    .tab.active {
      color: #1976d2;
      border-bottom-color: #1976d2;
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
    .consultation-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 16px;
      overflow: hidden;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .card-header:hover {
      background: #f5f5f5;
    }
    .header-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .avatar {
      width: 48px;
      height: 48px;
      background: #e3f2fd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    .header-info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
    }
    .header-info .date {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    .expand-icon {
      transition: transform 0.3s;
      font-size: 12px;
      color: #666;
    }
    .expand-icon.expanded {
      transform: rotate(180deg);
    }
    .card-body {
      padding: 0 20px 20px;
      border-top: 1px solid #eee;
    }
    .info-row {
      margin-top: 16px;
    }
    .info-row label {
      display: block;
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .info-row p {
      margin: 0;
    }
    .prescriptions-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }
    .prescriptions-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #1976d2;
    }
    .prescription-item {
      background: #e3f2fd;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .prescription-item strong {
      display: block;
      margin-bottom: 4px;
    }
    .prescription-item p {
      margin: 0;
      font-size: 14px;
    }
    .prescription-item .duration {
      color: #666;
      font-size: 12px;
      margin-top: 4px;
    }
    .prescription-item .instructions {
      font-style: italic;
      color: #555;
      margin-top: 8px;
    }
    .documents-section h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
    }
    .antecedents-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .antecedent-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .antecedent-card h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
    }
    .antecedent-card ul {
      margin: 0;
      padding-left: 20px;
    }
    .antecedent-card li {
      margin-bottom: 8px;
    }
    .antecedent-card .none {
      color: #999;
      font-style: italic;
      margin: 0;
    }
  `]
})
export class MedicalRecordComponent implements OnInit {
  consultations: Consultation[] = [];
  documents: UploadedDocument[] = [];
  antecedents = {
    allergies: [] as string[],
    maladiesChroniques: [] as string[],
    chirurgies: [] as string[],
    familiaux: [] as string[]
  };

  isLoading = true;
  activeTab: 'consultations' | 'documents' | 'antecedents' = 'consultations';
  expandedId: number | null = null;

  constructor(
    private consultationService: ConsultationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.consultationService.getPatientConsultations().subscribe({
      next: (data) => {
        this.consultations = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    this.loadDocuments();
    this.loadAntecedents();
  }

  loadDocuments(): void {
    this.http.get<UploadedDocument[]>(`${environment.apiUrl}/patient/documents`)
      .subscribe({
        next: (docs) => this.documents = docs,
        error: () => {}
      });
  }

  loadAntecedents(): void {
    this.http.get<any>(`${environment.apiUrl}/patient/antecedents`)
      .subscribe({
        next: (data) => this.antecedents = data,
        error: () => {}
      });
  }

  toggleConsultation(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  onDocumentUploaded(doc: UploadedDocument): void {
    // Already handled by the component
  }

  onDocumentDeleted(doc: UploadedDocument): void {
    // Already handled by the component
  }
}
