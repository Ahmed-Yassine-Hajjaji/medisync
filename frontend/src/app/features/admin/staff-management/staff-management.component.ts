import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface StaffMember {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: 'MEDECIN' | 'SECRETAIRE';
  specialite?: string;
  enabled: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="staff-management">
      <header class="page-header">
        <div>
          <h1>Gestion du personnel</h1>
          <p>Gerez les medecins et secretaires de la clinique</p>
        </div>
        <button class="btn-primary" (click)="openAddModal()">
          + Ajouter un membre
        </button>
      </header>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'medecins'" (click)="activeTab = 'medecins'; loadStaff()">
          Medecins ({{ medecins.length }})
        </button>
        <button class="tab" [class.active]="activeTab === 'secretaires'" (click)="activeTab = 'secretaires'; loadStaff()">
          Secretaires ({{ secretaires.length }})
        </button>
      </div>

      <div class="search-bar">
        <input type="text" [(ngModel)]="searchTerm" placeholder="Rechercher par nom, email..." (input)="filterStaff()">
      </div>

      @if (isLoading) {
        <div class="loading">Chargement...</div>
      } @else {
        <div class="staff-grid">
          @for (member of filteredStaff; track member.id) {
            <div class="staff-card" [class.disabled]="!member.enabled">
              <div class="card-header">
                <div class="avatar">{{ member.prenom[0] }}{{ member.nom[0] }}</div>
                <div class="info">
                  <h3>{{ member.prenom }} {{ member.nom }}</h3>
                  <span class="role-badge" [class]="member.role.toLowerCase()">
                    {{ member.role === 'MEDECIN' ? 'Medecin' : 'Secretaire' }}
                  </span>
                </div>
                <div class="status-indicator" [class.active]="member.enabled"></div>
              </div>

              @if (member.specialite) {
                <p class="specialite">{{ member.specialite }}</p>
              }

              <div class="details">
                <p><span class="icon">&#9993;</span> {{ member.email }}</p>
                @if (member.telephone) {
                  <p><span class="icon">&#128222;</span> {{ member.telephone }}</p>
                }
              </div>

              <div class="card-actions">
                <button class="btn-icon" (click)="editMember(member)" title="Modifier">&#9998;</button>
                <button class="btn-icon" (click)="toggleStatus(member)" [title]="member.enabled ? 'Desactiver' : 'Activer'">
                  {{ member.enabled ? '&#128683;' : '&#9989;' }}
                </button>
                <button class="btn-icon danger" (click)="deleteMember(member)" title="Supprimer">&#128465;</button>
              </div>
            </div>
          }
        </div>

        @if (filteredStaff.length === 0) {
          <div class="empty-state">
            <p>Aucun {{ activeTab === 'medecins' ? 'medecin' : 'secretaire' }} trouve</p>
          </div>
        }
      }

      <!-- Add/Edit Modal -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h2>{{ editingMember ? 'Modifier' : 'Ajouter' }} un {{ activeTab === 'medecins' ? 'medecin' : 'secretaire' }}</h2>

            <form [formGroup]="staffForm" (ngSubmit)="saveStaff()">
              <div class="form-row">
                <div class="form-group">
                  <label>Prenom *</label>
                  <input type="text" formControlName="prenom">
                </div>
                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" formControlName="nom">
                </div>
              </div>

              <div class="form-group">
                <label>Email *</label>
                <input type="email" formControlName="email">
              </div>

              <div class="form-group">
                <label>Telephone</label>
                <input type="tel" formControlName="telephone">
              </div>

              @if (!editingMember) {
                <div class="form-group">
                  <label>Mot de passe *</label>
                  <input type="password" formControlName="password">
                </div>
              }

              @if (activeTab === 'medecins') {
                <div class="form-group">
                  <label>Specialite *</label>
                  <select formControlName="specialite">
                    <option value="">Selectionnez...</option>
                    <option value="GENERALISTE">Medecine generale</option>
                    <option value="CARDIOLOGUE">Cardiologie</option>
                    <option value="DERMATOLOGUE">Dermatologie</option>
                    <option value="PEDIATRE">Pediatrie</option>
                    <option value="GYNECOLOGIE">Gynecologie</option>
                    <option value="OPHTALMOLOGIE">Ophtalmologie</option>
                    <option value="ORL">ORL</option>
                    <option value="NEUROLOGIE">Neurologie</option>
                    <option value="PSYCHIATRIE">Psychiatrie</option>
                    <option value="RADIOLOGIE">Radiologie</option>
                  </select>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Tarif consultation (EUR)</label>
                    <input type="number" formControlName="tarifConsultation">
                  </div>
                  <div class="form-group">
                    <label>Duree consultation (min)</label>
                    <input type="number" formControlName="dureeConsultation">
                  </div>
                </div>
              }

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
                <button type="submit" class="btn-primary" [disabled]="staffForm.invalid || isSaving">
                  {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .staff-management { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 8px 0; }
    .page-header p { margin: 0; color: #666; }
    .btn-primary { padding: 12px 24px; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-primary:hover { background: #1565c0; }
    .btn-secondary { padding: 12px 24px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
    .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .tab { padding: 12px 24px; border: none; background: #f5f5f5; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .tab.active { background: #1976d2; color: white; }
    .search-bar { margin-bottom: 24px; }
    .search-bar input { width: 100%; max-width: 400px; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .loading { text-align: center; padding: 60px; color: #666; }
    .staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .staff-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; }
    .staff-card:hover { transform: translateY(-2px); }
    .staff-card.disabled { opacity: 0.6; }
    .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .avatar { width: 48px; height: 48px; background: #1976d2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .info h3 { margin: 0 0 4px 0; font-size: 16px; }
    .role-badge { font-size: 11px; padding: 4px 8px; border-radius: 12px; text-transform: uppercase; }
    .role-badge.medecin { background: #e3f2fd; color: #1976d2; }
    .role-badge.secretaire { background: #f3e5f5; color: #7b1fa2; }
    .status-indicator { width: 12px; height: 12px; border-radius: 50%; background: #ccc; margin-left: auto; }
    .status-indicator.active { background: #4caf50; }
    .specialite { margin: 0 0 12px 0; color: #666; font-style: italic; }
    .details { border-top: 1px solid #eee; padding-top: 12px; margin-bottom: 12px; }
    .details p { margin: 6px 0; font-size: 14px; color: #555; }
    .details .icon { margin-right: 8px; }
    .card-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .btn-icon { width: 36px; height: 36px; border: 1px solid #ddd; background: white; border-radius: 8px; cursor: pointer; font-size: 16px; }
    .btn-icon:hover { background: #f5f5f5; }
    .btn-icon.danger:hover { background: #ffebee; color: #c62828; }
    .empty-state { text-align: center; padding: 60px; color: #666; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; padding: 32px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal h2 { margin: 0 0 24px 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class StaffManagementComponent implements OnInit {
  medecins: StaffMember[] = [];
  secretaires: StaffMember[] = [];
  filteredStaff: StaffMember[] = [];
  activeTab: 'medecins' | 'secretaires' = 'medecins';
  searchTerm = '';
  isLoading = true;
  showModal = false;
  editingMember: StaffMember | null = null;
  isSaving = false;
  staffForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.staffForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      password: [''],
      specialite: [''],
      tarifConsultation: [50],
      dureeConsultation: [30]
    });
  }

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading = true;
    const endpoint = this.activeTab === 'medecins' ? 'medecins' : 'secretaires';

    this.http.get<StaffMember[]>(`${environment.apiUrl}/admin/${endpoint}`).subscribe({
      next: (data) => {
        if (this.activeTab === 'medecins') {
          this.medecins = data;
        } else {
          this.secretaires = data;
        }
        this.filterStaff();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  filterStaff(): void {
    const staff = this.activeTab === 'medecins' ? this.medecins : this.secretaires;
    const term = this.searchTerm.toLowerCase();
    this.filteredStaff = staff.filter(m =>
      m.nom.toLowerCase().includes(term) ||
      m.prenom.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term)
    );
  }

  openAddModal(): void {
    this.editingMember = null;
    this.staffForm.reset({
      tarifConsultation: 50,
      dureeConsultation: 30
    });
    this.staffForm.get('password')?.setValidators(Validators.required);
    this.showModal = true;
  }

  editMember(member: StaffMember): void {
    this.editingMember = member;
    this.staffForm.patchValue(member);
    this.staffForm.get('password')?.clearValidators();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingMember = null;
  }

  saveStaff(): void {
    if (this.staffForm.invalid) return;

    this.isSaving = true;
    const data = { ...this.staffForm.value, role: this.activeTab === 'medecins' ? 'MEDECIN' : 'SECRETAIRE' };
    const endpoint = this.activeTab === 'medecins' ? 'medecins' : 'secretaires';

    const request = this.editingMember
      ? this.http.put(`${environment.apiUrl}/admin/${endpoint}/${this.editingMember.id}`, data)
      : this.http.post(`${environment.apiUrl}/admin/${endpoint}`, data);

    request.subscribe({
      next: () => {
        this.loadStaff();
        this.closeModal();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  toggleStatus(member: StaffMember): void {
    const endpoint = this.activeTab === 'medecins' ? 'medecins' : 'secretaires';
    this.http.patch(`${environment.apiUrl}/admin/${endpoint}/${member.id}/toggle-status`, {}).subscribe({
      next: () => {
        member.enabled = !member.enabled;
      }
    });
  }

  deleteMember(member: StaffMember): void {
    if (!confirm(`Supprimer ${member.prenom} ${member.nom}?`)) return;

    const endpoint = this.activeTab === 'medecins' ? 'medecins' : 'secretaires';
    this.http.delete(`${environment.apiUrl}/admin/${endpoint}/${member.id}`).subscribe({
      next: () => this.loadStaff()
    });
  }
}
