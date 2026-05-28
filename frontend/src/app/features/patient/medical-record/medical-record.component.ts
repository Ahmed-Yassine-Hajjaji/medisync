import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../../core/services/consultation.service';
import { Consultation } from '../../../core/models/consultation.model';
import { DocumentUploadComponent, UploadedDocument } from '../../../shared/components/document-upload/document-upload.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Prescription {
  id: number;
  dateCreation: string;
  medecinNom: string;
  medicaments: Array<{
    nom: string;
    dosage: string;
    frequence: string;
    dureeJours: number;
    instructions?: string;
  }>;
}

interface Analyse {
  id: number;
  type: string;
  dateAnalyse: string;
  laboratoire: string;
  statut: 'EN_ATTENTE' | 'RESULTAT_DISPONIBLE';
  resultats?: string;
}

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

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          [class.active]="activeTab === 'consultations'"
          (click)="activeTab = 'consultations'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Consultations
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'ordonnances'"
          (click)="activeTab = 'ordonnances'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
            <path d="m8.5 8.5 7 7"/>
          </svg>
          Ordonnances
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'documents'"
          (click)="activeTab = 'documents'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
            <path d="M10 9H8"/>
            <path d="M16 13H8"/>
            <path d="M16 17H8"/>
          </svg>
          Documents
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'analyses'"
          (click)="activeTab = 'analyses'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M12 18v-6"/>
            <path d="M8 18v-1"/>
            <path d="M16 18v-3"/>
          </svg>
          Analyses
        </button>
      </div>

      @if (isLoading) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
      } @else {
        <!-- Consultations Tab -->
        @if (activeTab === 'consultations') {
          <div class="tab-content">
            @if (consultations.length === 0) {
              <div class="empty-state">
                <div class="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <h3>Aucune consultation</h3>
                <p>Votre historique de consultations apparaitra ici apres votre premiere visite medicale.</p>
              </div>
            } @else {
              @for (consultation of consultations; track consultation.id) {
                <div class="consultation-card">
                  <div class="card-header" (click)="toggleConsultation(consultation.id)">
                    <div class="header-info">
                      <div class="avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 20a6 6 0 0 0-12 0"/>
                          <circle cx="12" cy="10" r="4"/>
                          <circle cx="12" cy="12" r="10"/>
                        </svg>
                      </div>
                      <div>
                        <h3>Dr. {{ consultation.medecinNom }}</h3>
                        <p class="date">{{ formatDate(consultation.dateConsultation) }}</p>
                      </div>
                    </div>
                    <span class="expand-icon" [class.expanded]="expandedId === consultation.id">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
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
                          <h4>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                              <path d="m8.5 8.5 7 7"/>
                            </svg>
                            Prescriptions
                          </h4>
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

        <!-- Ordonnances Tab -->
        @if (activeTab === 'ordonnances') {
          <div class="tab-content">
            @if (prescriptions.length === 0) {
              <div class="empty-state">
                <div class="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                    <path d="m8.5 8.5 7 7"/>
                  </svg>
                </div>
                <h3>Aucune ordonnance</h3>
                <p>Vos ordonnances medicales seront affichees ici. Elles sont generees automatiquement apres vos consultations.</p>
              </div>
            } @else {
              @for (prescription of prescriptions; track prescription.id) {
                <div class="prescription-card">
                  <div class="prescription-header">
                    <div class="prescription-info">
                      <h3>Ordonnance du {{ formatDate(prescription.dateCreation) }}</h3>
                      <p>Par Dr. {{ prescription.medecinNom }}</p>
                    </div>
                    <button class="btn-download">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Telecharger
                    </button>
                  </div>
                  <div class="prescription-body">
                    @for (med of prescription.medicaments; track med.nom) {
                      <div class="medicament-item">
                        <div class="med-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                            <path d="m8.5 8.5 7 7"/>
                          </svg>
                        </div>
                        <div class="med-details">
                          <strong>{{ med.nom }}</strong>
                          <span>{{ med.dosage }} - {{ med.frequence }} - {{ med.dureeJours }} jours</span>
                          @if (med.instructions) {
                            <em>{{ med.instructions }}</em>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- Documents Tab -->
        @if (activeTab === 'documents') {
          <div class="tab-content">
            <div class="upload-section">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Telecharger un document
              </h2>
              <app-document-upload
                [uploadedDocuments]="documents"
                (uploaded)="onDocumentUploaded($event)"
                (deleted)="onDocumentDeleted($event)">
              </app-document-upload>
            </div>

            @if (documents.length === 0) {
              <div class="empty-state">
                <div class="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                  </svg>
                </div>
                <h3>Aucun document</h3>
                <p>Deposez vos documents medicaux (analyses, radiographies, comptes rendus) en utilisant la zone de depot ci-dessus.</p>
              </div>
            }
          </div>
        }

        <!-- Analyses Tab -->
        @if (activeTab === 'analyses') {
          <div class="tab-content">
            @if (analyses.length === 0) {
              <div class="empty-state">
                <div class="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <path d="M12 18v-6"/>
                    <path d="M8 18v-1"/>
                    <path d="M16 18v-3"/>
                  </svg>
                </div>
                <h3>Aucune analyse</h3>
                <p>Vos resultats d'analyses medicales (prises de sang, radiographies, etc.) seront affiches ici des qu'ils seront disponibles.</p>
              </div>
            } @else {
              @for (analyse of analyses; track analyse.id) {
                <div class="analyse-card" [class.disponible]="analyse.statut === 'RESULTAT_DISPONIBLE'">
                  <div class="analyse-header">
                    <div class="analyse-type">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <path d="M12 18v-6"/>
                        <path d="M8 18v-1"/>
                        <path d="M16 18v-3"/>
                      </svg>
                      <h3>{{ analyse.type }}</h3>
                    </div>
                    <span class="statut" [class.disponible]="analyse.statut === 'RESULTAT_DISPONIBLE'">
                      @if (analyse.statut === 'RESULTAT_DISPONIBLE') {
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Disponible
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        En attente
                      }
                    </span>
                  </div>
                  <div class="analyse-meta">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {{ formatDate(analyse.dateAnalyse) }}
                    </span>
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      {{ analyse.laboratoire }}
                    </span>
                  </div>
                  @if (analyse.statut === 'RESULTAT_DISPONIBLE' && analyse.resultats) {
                    <div class="analyse-resultats">
                      <p>{{ analyse.resultats }}</p>
                    </div>
                  }
                </div>
              }
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .medical-record {
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

    /* Tabs */
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--gray-200);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      border: none;
      background: none;
      font-size: 0.9375rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      color: var(--gray-500);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: all 0.2s;
      white-space: nowrap;

      svg {
        flex-shrink: 0;
      }

      &:hover {
        color: var(--primary);
      }

      &.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
    }

    /* Loading */
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

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
    }

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

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .empty-state p {
      margin: 0;
      color: var(--gray-500);
      max-width: 400px;
      margin: 0 auto;
      line-height: 1.5;
    }

    /* Tab Content */
    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Consultation Card */
    .consultation-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--gray-50);
      }
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      .avatar {
        width: 48px;
        height: 48px;
        background: var(--primary-light);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
      }

      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
      }

      .date {
        margin: 0;
        font-size: 0.875rem;
        color: var(--gray-500);
      }
    }

    .expand-icon {
      color: var(--gray-400);
      transition: transform 0.2s;

      &.expanded {
        transform: rotate(180deg);
      }
    }

    .card-body {
      padding: 0 1.25rem 1.25rem;
      border-top: 1px solid var(--gray-100);
    }

    .info-row {
      margin-top: 1rem;

      label {
        display: block;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--gray-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        color: var(--gray-700);
        line-height: 1.5;
      }
    }

    .prescriptions-section {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-100);

      h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 0.75rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--primary);
      }
    }

    .prescription-item {
      background: var(--primary-light);
      padding: 0.875rem;
      border-radius: var(--radius-md);
      margin-bottom: 0.5rem;

      strong {
        display: block;
        color: var(--gray-900);
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--gray-600);
      }

      .duration {
        color: var(--gray-500);
        font-size: 0.8125rem;
        margin-top: 0.25rem;
      }

      .instructions {
        font-style: italic;
        color: var(--gray-500);
        margin-top: 0.5rem;
      }
    }

    /* Prescription/Ordonnance Card */
    .prescription-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .prescription-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--gray-100);

      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--gray-500);
      }
    }

    .btn-download {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--primary-dark);
      }
    }

    .prescription-body {
      padding: 1rem 1.25rem;
    }

    .medicament-item {
      display: flex;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--gray-100);

      &:last-child {
        border-bottom: none;
      }

      .med-icon {
        width: 36px;
        height: 36px;
        background: var(--primary-light);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
        flex-shrink: 0;
      }

      .med-details {
        flex: 1;

        strong {
          display: block;
          color: var(--gray-900);
          margin-bottom: 0.125rem;
        }

        span {
          display: block;
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        em {
          display: block;
          font-size: 0.8125rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }
      }
    }

    /* Documents Section */
    .upload-section {
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      padding: 1.25rem;
      margin-bottom: 1rem;

      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
      }
    }

    /* Analyse Card */
    .analyse-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      padding: 1.25rem;

      &.disponible {
        border-left: 3px solid var(--success);
      }
    }

    .analyse-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .analyse-type {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      svg {
        color: var(--primary);
      }

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
      }
    }

    .statut {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      background: var(--gray-100);
      color: var(--gray-600);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 500;

      &.disponible {
        background: #DCFCE7;
        color: #16A34A;
      }
    }

    .analyse-meta {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 0.75rem;

      span {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.875rem;
        color: var(--gray-500);
      }
    }

    .analyse-resultats {
      padding-top: 0.75rem;
      border-top: 1px solid var(--gray-100);

      p {
        margin: 0;
        color: var(--gray-700);
        line-height: 1.5;
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .tabs {
        gap: 0;
      }

      .tab {
        padding: 0.75rem 0.75rem;
        font-size: 0.875rem;

        svg {
          display: none;
        }
      }

      .prescription-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .btn-download {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class MedicalRecordComponent implements OnInit {
  consultations: Consultation[] = [];
  prescriptions: Prescription[] = [];
  documents: UploadedDocument[] = [];
  analyses: Analyse[] = [];

  isLoading = true;
  activeTab: 'consultations' | 'ordonnances' | 'documents' | 'analyses' = 'consultations';
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
        // Extract prescriptions from consultations
        this.extractPrescriptions();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    this.loadDocuments();
    this.loadAnalyses();
  }

  extractPrescriptions(): void {
    // Extract prescriptions from consultations to show in Ordonnances tab
    this.prescriptions = this.consultations
      .filter(c => c.prescriptions && c.prescriptions.length > 0)
      .map(c => ({
        id: c.id,
        dateCreation: c.dateConsultation,
        medecinNom: c.medecinNom || 'Medecin',
        medicaments: c.prescriptions!.map(p => ({
          nom: p.medicament,
          dosage: p.dosage,
          frequence: p.frequence,
          dureeJours: p.dureeJours,
          instructions: p.instructions
        }))
      }));
  }

  loadDocuments(): void {
    this.http.get<UploadedDocument[]>(`${environment.apiUrl}/patient/documents`)
      .subscribe({
        next: (docs) => this.documents = docs,
        error: () => {}
      });
  }

  loadAnalyses(): void {
    this.http.get<Analyse[]>(`${environment.apiUrl}/patient/analyses`)
      .subscribe({
        next: (data) => this.analyses = data,
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
