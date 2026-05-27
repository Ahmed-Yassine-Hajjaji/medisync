import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardStats } from '../../../core/models/clinique.model';
import { Patient, Medecin } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Tableau de bord administrateur</h1>
        <p>Vue d'ensemble de la clinique</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats?.totalPatients || 0 }}</div>
            <div class="stat-label">Patients</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">🩺</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats?.totalMedecins || 0 }}</div>
            <div class="stat-label">Medecins</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats?.totalAppointmentsToday || 0 }}</div>
            <div class="stat-label">RDV aujourd'hui</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">💶</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats?.revenueMonth || 0 }} EUR</div>
            <div class="stat-label">Revenu du mois</div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <h2>Medecins</h2>
            <button class="btn btn-primary btn-sm" (click)="showAddMedecin = true">+ Ajouter</button>
          </div>

          @if (showAddMedecin) {
            <div class="add-form">
              <div class="form-row">
                <div class="form-group">
                  <input type="text" [(ngModel)]="newMedecin.prenom" placeholder="Prenom">
                </div>
                <div class="form-group">
                  <input type="text" [(ngModel)]="newMedecin.nom" placeholder="Nom">
                </div>
              </div>
              <div class="form-group">
                <input type="email" [(ngModel)]="newMedecin.email" placeholder="Email">
              </div>
              <div class="form-group">
                <select [(ngModel)]="newMedecin.specialite">
                  <option value="">Specialite</option>
                  <option value="GENERALISTE">Generaliste</option>
                  <option value="CARDIOLOGUE">Cardiologue</option>
                  <option value="DERMATOLOGUE">Dermatologue</option>
                  <option value="PEDIATRE">Pediatre</option>
                </select>
              </div>
              <div class="form-group">
                <input type="password" [(ngModel)]="newMedecinPassword" placeholder="Mot de passe">
              </div>
              <div class="form-actions">
                <button class="btn btn-secondary btn-sm" (click)="showAddMedecin = false">Annuler</button>
                <button class="btn btn-primary btn-sm" (click)="createMedecin()">Creer</button>
              </div>
            </div>
          }

          <table class="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Specialite</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (medecin of medecins; track medecin.id) {
                <tr>
                  <td>Dr. {{ medecin.prenom }} {{ medecin.nom }}</td>
                  <td>{{ medecin.specialite }}</td>
                  <td>{{ medecin.email }}</td>
                  <td>
                    <span class="badge" [class]="medecin.enabled ? 'badge-success' : 'badge-danger'">
                      {{ medecin.enabled ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm" [class]="medecin.enabled ? 'btn-danger' : 'btn-success'" (click)="toggleUserStatus(medecin.id, !medecin.enabled)">
                      {{ medecin.enabled ? 'Desactiver' : 'Activer' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="card">
          <h2>Patients recents</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Telephone</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              @for (patient of patients.slice(0, 10); track patient.id) {
                <tr>
                  <td>{{ patient.prenom }} {{ patient.nom }}</td>
                  <td>{{ patient.email }}</td>
                  <td>{{ patient.telephone || '-' }}</td>
                  <td>
                    <span class="badge" [class]="patient.enabled ? 'badge-success' : 'badge-danger'">
                      {{ patient.enabled ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;

      @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;

      .stat-icon { font-size: 2rem; }
      .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
      .stat-label { color: var(--gray-500); font-size: 0.875rem; }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 1.5rem;

      @media (max-width: 1024px) { grid-template-columns: 1fr; }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h2 { margin: 0; }
    }

    h2 { margin-bottom: 1rem; }

    .add-form {
      background: var(--gray-50);
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .form-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }

    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  medecins: Medecin[] = [];
  patients: Patient[] = [];
  showAddMedecin = false;
  newMedecin: Partial<Medecin> = {};
  newMedecinPassword = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadMedecins();
    this.loadPatients();
  }

  loadStats(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => this.stats = data
    });
  }

  loadMedecins(): void {
    this.adminService.getAllMedecins().subscribe({
      next: (data) => this.medecins = data
    });
  }

  loadPatients(): void {
    this.adminService.getAllPatients().subscribe({
      next: (data) => this.patients = data
    });
  }

  createMedecin(): void {
    if (!this.newMedecin.email || !this.newMedecinPassword) return;

    this.adminService.createMedecin(this.newMedecin, this.newMedecinPassword).subscribe({
      next: () => {
        this.loadMedecins();
        this.showAddMedecin = false;
        this.newMedecin = {};
        this.newMedecinPassword = '';
      }
    });
  }

  toggleUserStatus(id: number, enabled: boolean): void {
    this.adminService.toggleUserStatus(id, enabled).subscribe({
      next: () => {
        const medecin = this.medecins.find(m => m.id === id);
        if (medecin) medecin.enabled = enabled;
      }
    });
  }
}
