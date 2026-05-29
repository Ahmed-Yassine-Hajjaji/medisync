import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LucideDynamicIcon, LucidePlus, LucideSearch, LucidePencil } from '@lucide/angular';

import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/user.model';

@Component({
  selector: 'app-secretaire-patients',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, DialogModule, ToastModule,
    LucideDynamicIcon
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="page-header">
      <div>
        <h1>Patients</h1>
        <p class="text-muted">Annuaire et gestion des dossiers patients.</p>
      </div>
      <button class="btn-primary" (click)="openCreate()">
        <svg [lucideIcon]="iconPlus" [size]="16"></svg>
        Nouveau patient
      </button>
    </div>

    <div class="search-bar">
      <svg [lucideIcon]="iconSearch" [size]="18" class="search-icon"></svg>
      <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()"
             placeholder="Rechercher par nom, prénom ou email...">
    </div>

    <div class="table-card">
      <p-table [value]="filtered" [paginator]="true" [rows]="15" [loading]="loading"
               styleClass="minimal-table" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th>Patient</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Date de naissance</th>
            <th>Groupe sanguin</th>
            <th style="width: 80px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>
              <div class="patient-cell">
                <div class="avatar">{{ initials(row) }}</div>
                <strong>{{ row.prenom }} {{ row.nom }}</strong>
              </div>
            </td>
            <td>{{ row.email }}</td>
            <td>{{ row.telephone || '—' }}</td>
            <td>{{ row.dateNaissance || '—' }}</td>
            <td>{{ row.groupeSanguin || '—' }}</td>
            <td>
              <button class="icon-btn" title="Modifier" (click)="openEdit(row)">
                <svg [lucideIcon]="iconEdit" [size]="14"></svg>
              </button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="empty-cell">Aucun patient</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [header]="editing ? 'Modifier patient' : 'Nouveau patient'"
              [(visible)]="showDialog" [modal]="true" [style]="{ width: '560px' }" [draggable]="false">
      <form [formGroup]="form" class="dialog-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Prénom *</label>
            <input type="text" formControlName="prenom">
          </div>
          <div class="form-group">
            <label>Nom *</label>
            <input type="text" formControlName="nom">
          </div>
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input type="email" formControlName="email" [readonly]="editing">
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Téléphone</label>
            <input type="tel" formControlName="telephone">
          </div>
          <div class="form-group">
            <label>Date de naissance</label>
            <input type="date" formControlName="dateNaissance">
          </div>
        </div>
        <div class="form-group">
          <label>Adresse</label>
          <input type="text" formControlName="adresse">
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Groupe sanguin</label>
            <select formControlName="groupeSanguin">
              <option value="">—</option>
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>
          </div>
          @if (!editing) {
            <div class="form-group">
              <label>Mot de passe initial</label>
              <input type="text" formControlName="password" placeholder="Changeme@2026">
            </div>
          }
        </div>
        <div class="form-group">
          <label>Allergies</label>
          <textarea formControlName="allergies" rows="2"></textarea>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button class="btn-secondary" (click)="showDialog = false">Annuler</button>
        <button class="btn-primary" (click)="save()" [disabled]="form.invalid">Enregistrer</button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host { display: block; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
    .page-header p { margin: 0.25rem 0 0; }
    .text-muted { color: #64748b; font-size: 0.875rem; }
    .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem;
      background: #1E6FD9; color: white; border: none; border-radius: 8px;
      padding: 0.625rem 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background: #1859B3; }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-secondary { background: transparent; color: #475569; border: 1px solid #e2e8f0;
      border-radius: 8px; padding: 0.5rem 1rem; font-weight: 500; cursor: pointer; margin-right: 0.5rem; }

    .search-bar {
      position: relative; margin-bottom: 1rem;
    }
    .search-bar .search-icon {
      position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
      color: #94a3b8;
    }
    .search-bar input {
      width: 100%; padding: 0.625rem 0.875rem 0.625rem 2.5rem; border: 1px solid #e2e8f0;
      border-radius: 10px; font-size: 0.875rem; background: white;
    }
    .search-bar input:focus { outline: none; border-color: #1E6FD9; }

    .table-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    :host ::ng-deep .minimal-table .p-datatable-thead > tr > th {
      background: #f8fafc; color: #475569; font-weight: 600; font-size: 0.75rem;
      text-transform: uppercase; letter-spacing: 0.04em; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;
    }
    :host ::ng-deep .minimal-table .p-datatable-tbody > tr > td {
      padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem;
    }
    :host ::ng-deep .minimal-table .p-datatable-tbody > tr:hover { background: #f8fafc; }

    .patient-cell { display: flex; align-items: center; gap: 0.625rem; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #1E6FD9, #1859B3); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.75rem;
    }
    .icon-btn {
      width: 28px; height: 28px; border-radius: 6px; border: none; cursor: pointer;
      background: #EFF6FF; color: #1E6FD9;
      display: inline-flex; align-items: center; justify-content: center; transition: transform 0.15s;
    }
    .icon-btn:hover { transform: scale(1.08); }
    .empty-cell { text-align: center; padding: 2rem; color: #94a3b8; }

    .dialog-form { padding: 0.5rem 0; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 500; color: #334155; margin-bottom: 0.375rem; font-size: 0.875rem; }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 0.875rem; font-family: inherit;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none; border-color: #1E6FD9;
    }
    .form-group input[readonly] { background: #f8fafc; color: #64748b; }
  `]
})
export class SecretairePatientsComponent implements OnInit {
  iconPlus = LucidePlus.icon;
  iconSearch = LucideSearch.icon;
  iconEdit = LucidePencil.icon;

  loading = false;
  all: Patient[] = [];
  filtered: Patient[] = [];
  search = '';
  searchTimer: any;

  showDialog = false;
  editing: Patient | null = null;
  form: FormGroup;

  constructor(
    private patientService: PatientService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      dateNaissance: [''],
      adresse: [''],
      groupeSanguin: [''],
      allergies: [''],
      password: ['']
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.patientService.getAllPatients().subscribe({
      next: list => {
        this.all = list;
        this.filtered = list;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const q = this.search.trim().toLowerCase();
      if (!q) { this.filtered = this.all; return; }
      this.filtered = this.all.filter(p =>
        p.nom?.toLowerCase().includes(q) ||
        p.prenom?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
      );
    }, 200);
  }

  openCreate(): void {
    this.editing = null;
    this.form.reset({ prenom: '', nom: '', email: '', telephone: '', dateNaissance: '',
      adresse: '', groupeSanguin: '', allergies: '', password: '' });
    this.form.get('email')?.enable();
    this.showDialog = true;
  }

  openEdit(p: Patient): void {
    this.editing = p;
    this.form.patchValue({
      prenom: p.prenom, nom: p.nom, email: p.email,
      telephone: p.telephone || '', dateNaissance: p.dateNaissance || '',
      adresse: p.adresse || '', groupeSanguin: p.groupeSanguin || '',
      allergies: p.allergies || '', password: ''
    });
    this.showDialog = true;
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const dto: Partial<Patient> = {
      prenom: v.prenom, nom: v.nom, email: v.email,
      telephone: v.telephone, dateNaissance: v.dateNaissance,
      adresse: v.adresse, groupeSanguin: v.groupeSanguin,
      allergies: v.allergies
    };
    if (this.editing) {
      this.patientService.updatePatientBySecretaire(this.editing.id, dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Modifié', detail: 'Patient mis à jour' });
          this.showDialog = false;
          this.load();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour' })
      });
    } else {
      this.patientService.createPatientBySecretaire(dto, v.password).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Créé', detail: 'Patient créé avec succès' });
          this.showDialog = false;
          this.load();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la création' })
      });
    }
  }

  initials(p: Patient): string {
    return `${(p.prenom || '?').charAt(0)}${(p.nom || '?').charAt(0)}`.toUpperCase();
  }
}
