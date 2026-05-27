import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedecinService } from '../../../core/services/medecin.service';
import { Medecin } from '../../../core/models/user.model';

@Component({
  selector: 'app-medecins-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="medecins-page">
      <div class="page-hero">
        <div class="container">
          <h1>Trouvez votre medecin</h1>
          <p>{{ filteredMedecins.length }} praticiens disponibles au Maroc</p>
        </div>
      </div>

      <div class="container">
        <div class="filters-section">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="applyFilters()"
              placeholder="Rechercher un medecin par nom..."
            >
          </div>

          <div class="filters-row">
            <div class="filter-group">
              <label>Specialite</label>
              <select [(ngModel)]="selectedSpecialite" (change)="applyFilters()">
                <option value="">Toutes</option>
                @for (spec of specialites; track spec) {
                  <option [value]="spec">{{ formatSpecialite(spec) }}</option>
                }
              </select>
            </div>

            <div class="filter-group">
              <label>Ville</label>
              <select [(ngModel)]="selectedVille" (change)="applyFilters()">
                <option value="">Toutes les villes</option>
                @for (ville of villes; track ville) {
                  <option [value]="ville">{{ ville }}</option>
                }
              </select>
            </div>

            <div class="filter-group">
              <label>Langue</label>
              <select [(ngModel)]="selectedLangue" (change)="applyFilters()">
                <option value="">Toutes</option>
                <option value="Arabe">Arabe</option>
                <option value="Francais">Francais</option>
                <option value="Anglais">Anglais</option>
                <option value="Amazigh">Amazigh</option>
                <option value="Espagnol">Espagnol</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Trier par</label>
              <select [(ngModel)]="sortBy" (change)="sortMedecins()">
                <option value="">Par defaut</option>
                <option value="rating">Meilleures notes</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix decroissant</option>
              </select>
            </div>
          </div>
        </div>

        <div class="medecins-grid">
          @for (medecin of filteredMedecins; track medecin.id) {
            <div class="medecin-card">
              <div class="card-header">
                <div class="medecin-avatar">
                  {{ medecin.prenom?.[0] || '' }}{{ medecin.nom?.[0] || '' }}
                </div>
                <div class="specialite-badge" [class]="getSpecialiteClass(medecin.specialite)">
                  {{ formatSpecialite(medecin.specialite) }}
                </div>
              </div>

              <div class="card-body">
                <h3>Dr. {{ medecin.prenom }} {{ medecin.nom }}</h3>

                @if (medecin.description) {
                  <p class="description">{{ medecin.description }}</p>
                }

                <div class="meta-info">
                  @if (medecin.noteMoyenne && medecin.noteMoyenne > 0) {
                    <div class="rating">
                      <div class="stars">
                        @for (star of [1,2,3,4,5]; track star) {
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            [attr.fill]="star <= Math.round(medecin.noteMoyenne || 0) ? '#F59E0B' : 'none'"
                            stroke="#F59E0B"
                            stroke-width="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        }
                      </div>
                      <span class="rating-text">{{ medecin.noteMoyenne?.toFixed(1) }} ({{ medecin.nombreAvis || 0 }} avis)</span>
                    </div>
                  }

                  @if (medecin.languesParlees) {
                    <div class="languages">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m5 8 6 6"/>
                        <path d="m4 14 6-6 2-3"/>
                        <path d="M2 5h12"/>
                        <path d="M7 2h1"/>
                        <path d="m22 22-5-10-5 10"/>
                        <path d="M14 18h6"/>
                      </svg>
                      <span>{{ medecin.languesParlees }}</span>
                    </div>
                  }

                  @if (medecin.dureeConsultation) {
                    <div class="duration">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{{ medecin.dureeConsultation }} min</span>
                    </div>
                  }
                </div>
              </div>

              <div class="card-footer">
                <div class="price">
                  <span class="price-label">Consultation</span>
                  <span class="price-value">{{ medecin.tarifConsultation || 0 }} DH</span>
                </div>
                <a [routerLink]="['/medecins', medecin.id]" class="btn btn-primary">
                  <span>Prendre RDV</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              </div>
            </div>
          } @empty {
            <div class="no-results">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <h3>Aucun medecin trouve</h3>
              <p>Essayez de modifier vos criteres de recherche</p>
              <button class="btn btn-secondary" (click)="resetFilters()">Reinitialiser les filtres</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .medecins-page {
      background: var(--gray-50);
      min-height: 100vh;
      padding-bottom: 3rem;
    }

    .page-hero {
      background: linear-gradient(135deg, #1E6FD9 0%, #1550A8 100%);
      color: white;
      padding: 3rem 0;
      margin-bottom: 2rem;

      h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        color: white;
      }

      p {
        opacity: 0.9;
        font-size: 1.0625rem;
      }
    }

    .filters-section {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow);
    }

    .search-box {
      position: relative;
      margin-bottom: 1.25rem;

      svg {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--gray-400);
      }

      input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 3rem;
        font-size: 1rem;
        border: 1.5px solid var(--gray-200);
        border-radius: var(--radius-md);
        transition: all 0.2s;

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(30, 111, 217, 0.1);
        }
      }
    }

    .filters-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .filter-group {
      label {
        display: block;
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--gray-600);
        margin-bottom: 0.375rem;
      }

      select {
        width: 100%;
        padding: 0.625rem 0.875rem;
        font-size: 0.9375rem;
        border: 1.5px solid var(--gray-200);
        border-radius: var(--radius-md);
        background: var(--white);
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--primary);
        }
      }
    }

    .medecins-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .medecin-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      overflow: hidden;
      transition: all 0.3s;
      border: 1px solid var(--gray-100);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }
    }

    .card-header {
      position: relative;
      padding: 1.5rem;
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .medecin-avatar {
      width: 72px;
      height: 72px;
      border-radius: var(--radius-lg);
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .specialite-badge {
      padding: 0.375rem 0.875rem;
      border-radius: var(--radius-full);
      font-size: 0.8125rem;
      font-weight: 500;

      &.generaliste {
        background: #DBEAFE;
        color: #1E40AF;
      }

      &.cardiologue {
        background: #FEE2E2;
        color: #991B1B;
      }

      &.dermatologue {
        background: #FCE7F3;
        color: #9D174D;
      }

      &.pediatre {
        background: #D1FAE5;
        color: #065F46;
      }

      &.gynecologie {
        background: #EDE9FE;
        color: #5B21B6;
      }

      &.ophtalmologie {
        background: #E0F2FE;
        color: #075985;
      }

      &.orl {
        background: #FEF3C7;
        color: #92400E;
      }

      &.chirurgien {
        background: #FECACA;
        color: #B91C1C;
      }

      &.default {
        background: var(--gray-100);
        color: var(--gray-700);
      }
    }

    .card-body {
      padding: 1.25rem 1.5rem;

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .description {
        font-size: 0.875rem;
        color: var(--gray-500);
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .meta-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .stars {
        display: flex;
        gap: 2px;
      }

      .rating-text {
        font-size: 0.8125rem;
        color: var(--gray-600);
      }
    }

    .languages, .duration {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--gray-500);

      svg {
        flex-shrink: 0;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--gray-50);
      border-top: 1px solid var(--gray-100);
    }

    .price {
      .price-label {
        display: block;
        font-size: 0.75rem;
        color: var(--gray-500);
      }

      .price-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary);
      }
    }

    .card-footer .btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.625rem 1rem;
    }

    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);

      svg {
        color: var(--gray-300);
        margin-bottom: 1rem;
      }

      h3 {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--gray-500);
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class MedecinsListComponent implements OnInit {
  Math = Math;

  medecins: Medecin[] = [];
  filteredMedecins: Medecin[] = [];
  specialites: string[] = [];

  searchQuery = '';
  selectedSpecialite = '';
  selectedVille = '';
  selectedLangue = '';
  sortBy = '';

  villes = [
    'Casablanca',
    'Rabat',
    'Marrakech',
    'Fes',
    'Tanger',
    'Agadir',
    'Meknes',
    'Oujda',
    'Kenitra',
    'Tetouan',
    'Sale',
    'Nador',
    'Mohammedia',
    'El Jadida'
  ];

  constructor(
    private medecinService: MedecinService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadMedecins();
    this.loadSpecialites();

    // Check for ville query param from home page
    this.route.queryParams.subscribe(params => {
      if (params['ville']) {
        this.selectedVille = params['ville'];
        this.applyFilters();
      }
    });
  }

  loadMedecins(): void {
    this.medecinService.getAllMedecins().subscribe({
      next: (data) => {
        this.medecins = data;
        this.filteredMedecins = data;
        this.applyFilters();
      }
    });
  }

  loadSpecialites(): void {
    this.medecinService.getSpecialites().subscribe({
      next: (data) => this.specialites = data
    });
  }

  applyFilters(): void {
    this.filteredMedecins = this.medecins.filter(m => {
      const matchesSearch = !this.searchQuery ||
        m.nom?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        m.prenom?.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesSpecialite = !this.selectedSpecialite ||
        m.specialite === this.selectedSpecialite;

      const matchesLangue = !this.selectedLangue ||
        m.languesParlees?.toLowerCase().includes(this.selectedLangue.toLowerCase());

      // Note: Ville filtering would need the ville field in Medecin model
      // For now, we'll skip it until backend supports it

      return matchesSearch && matchesSpecialite && matchesLangue;
    });

    this.sortMedecins();
  }

  sortMedecins(): void {
    switch (this.sortBy) {
      case 'rating':
        this.filteredMedecins.sort((a, b) => (b.noteMoyenne || 0) - (a.noteMoyenne || 0));
        break;
      case 'price-asc':
        this.filteredMedecins.sort((a, b) => (a.tarifConsultation || 0) - (b.tarifConsultation || 0));
        break;
      case 'price-desc':
        this.filteredMedecins.sort((a, b) => (b.tarifConsultation || 0) - (a.tarifConsultation || 0));
        break;
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedSpecialite = '';
    this.selectedVille = '';
    this.selectedLangue = '';
    this.sortBy = '';
    this.filteredMedecins = [...this.medecins];
  }

  formatSpecialite(specialite: string): string {
    const formats: Record<string, string> = {
      'GENERALISTE': 'Generaliste',
      'CARDIOLOGUE': 'Cardiologue',
      'DERMATOLOGUE': 'Dermatologue',
      'PEDIATRE': 'Pediatre',
      'GYNECOLOGIE': 'Gynecologie',
      'OPHTALMOLOGIE': 'Ophtalmologie',
      'ORL': 'ORL',
      'NEUROLOGIE': 'Neurologie',
      'PSYCHIATRIE': 'Psychiatrie',
      'RADIOLOGIE': 'Radiologie',
      'CHIRURGIEN': 'Chirurgien'
    };
    return formats[specialite] || specialite;
  }

  getSpecialiteClass(specialite: string): string {
    const classes: Record<string, string> = {
      'GENERALISTE': 'generaliste',
      'CARDIOLOGUE': 'cardiologue',
      'DERMATOLOGUE': 'dermatologue',
      'PEDIATRE': 'pediatre',
      'GYNECOLOGIE': 'gynecologie',
      'OPHTALMOLOGIE': 'ophtalmologie',
      'ORL': 'orl',
      'CHIRURGIEN': 'chirurgien'
    };
    return classes[specialite] || 'default';
  }
}
