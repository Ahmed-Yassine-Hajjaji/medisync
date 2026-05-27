import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedecinService } from '../../../core/services/medecin.service';
import { Medecin } from '../../../core/models/user.model';

@Component({
  selector: 'app-medecins-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Nos medecins</h1>
        <p>Trouvez le praticien adapte a vos besoins</p>
      </div>

      <div class="filters card">
        <div class="filter-row">
          <div class="form-group">
            <label>Rechercher</label>
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Nom du medecin...">
          </div>
          <div class="form-group">
            <label>Specialite</label>
            <select [(ngModel)]="selectedSpecialite" (change)="onFilter()">
              <option value="">Toutes les specialites</option>
              @for (spec of specialites; track spec) {
                <option [value]="spec">{{ spec }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <div class="medecins-grid">
        @for (medecin of filteredMedecins; track medecin.id) {
          <div class="medecin-card card">
            <div class="medecin-avatar">
              {{ medecin.prenom[0] }}{{ medecin.nom[0] }}
            </div>
            <div class="medecin-info">
              <h3>Dr. {{ medecin.prenom }} {{ medecin.nom }}</h3>
              <span class="specialite">{{ medecin.specialite }}</span>
              @if (medecin.noteMoyenne && medecin.noteMoyenne > 0) {
                <div class="rating">
                  ⭐ {{ medecin.noteMoyenne?.toFixed(1) }} ({{ medecin.nombreAvis }} avis)
                </div>
              }
              @if (medecin.tarifConsultation) {
                <div class="tarif">{{ medecin.tarifConsultation }} DH</div>
              }
            </div>
            <a [routerLink]="['/medecins', medecin.id]" class="btn btn-primary">Voir profil</a>
          </div>
        } @empty {
          <div class="no-results">
            <p>Aucun medecin trouve</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .filters {
      margin-bottom: 2rem;
    }

    .filter-row {
      display: grid;
      grid-template-columns: 1fr 200px;
      gap: 1rem;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .medecins-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .medecin-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .medecin-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .medecin-info {
      margin-bottom: 1rem;

      h3 {
        font-size: 1.125rem;
        margin-bottom: 0.25rem;
      }

      .specialite {
        color: var(--gray-500);
        font-size: 0.875rem;
      }

      .rating {
        margin-top: 0.5rem;
        font-size: 0.875rem;
      }

      .tarif {
        margin-top: 0.25rem;
        font-weight: 600;
        color: var(--primary);
      }
    }

    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: var(--gray-500);
    }
  `]
})
export class MedecinsListComponent implements OnInit {
  medecins: Medecin[] = [];
  filteredMedecins: Medecin[] = [];
  specialites: string[] = [];
  searchQuery = '';
  selectedSpecialite = '';

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
    this.loadMedecins();
    this.loadSpecialites();
  }

  loadMedecins(): void {
    this.medecinService.getAllMedecins().subscribe({
      next: (data) => {
        this.medecins = data;
        this.filteredMedecins = data;
      }
    });
  }

  loadSpecialites(): void {
    this.medecinService.getSpecialites().subscribe({
      next: (data) => this.specialites = data
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    if (this.selectedSpecialite) {
      this.medecinService.getMedecinsBySpecialite(this.selectedSpecialite).subscribe({
        next: (data) => {
          this.filteredMedecins = data;
          if (this.searchQuery) {
            this.filteredMedecins = this.filteredMedecins.filter(m =>
              m.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
              m.prenom.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
          }
        }
      });
    } else {
      this.applyFilters();
    }
  }

  private applyFilters(): void {
    this.filteredMedecins = this.medecins.filter(m => {
      const matchesSearch = !this.searchQuery ||
        m.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        m.prenom.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesSpecialite = !this.selectedSpecialite || m.specialite === this.selectedSpecialite;
      return matchesSearch && matchesSpecialite;
    });
  }
}
