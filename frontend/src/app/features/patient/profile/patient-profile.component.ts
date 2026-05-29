import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LucideDynamicIcon, LucideX, LucidePlus } from '@lucide/angular';
import { PatientService } from '../../../core/services/patient.service';

const GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, LucideDynamicIcon],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="profile-page">
      <header class="page-header">
        <div>
          <h1>Mon profil</h1>
          <p class="text-muted">Vos coordonnées et votre dossier médical de base.</p>
        </div>
      </header>

      <form class="card" [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Bandeau identité -->
        <div class="identity-strip">
          <div class="big-avatar">{{ initials }}</div>
          <div>
            <h2>{{ form.get('prenom')?.value || 'Prénom' }} {{ form.get('nom')?.value || 'Nom' }}</h2>
            <p class="text-muted">{{ form.get('email')?.value }}</p>
          </div>
        </div>

        <!-- Section 1 : Informations personnelles -->
        <section class="section">
          <h3>Informations personnelles</h3>

          <div class="form-row">
            <div class="form-group">
              <label>Prénom *</label>
              <input type="text" class="form-control" formControlName="prenom">
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" class="form-control" formControlName="nom">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" class="form-control" formControlName="email" readonly>
              <small class="form-hint">L'email ne peut pas être modifié.</small>
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input type="tel" class="form-control" formControlName="telephone" placeholder="06 00 00 00 00">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date de naissance</label>
              <input type="date" class="form-control" formControlName="dateNaissance">
            </div>
            <div class="form-group">
              <label>Adresse</label>
              <input type="text" class="form-control" formControlName="adresse" placeholder="Casablanca">
            </div>
          </div>
        </section>

        <!-- Section 2 : Informations médicales -->
        <section class="section">
          <h3>Informations médicales</h3>

          <div class="form-row">
            <div class="form-group">
              <label>Groupe sanguin</label>
              <select class="form-control" formControlName="groupeSanguin">
                <option value="">— Non renseigné —</option>
                @for (g of groupesSanguins; track g) {
                  <option [value]="g">{{ g }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Antécédents médicaux</label>
              <textarea class="form-control" rows="3" formControlName="antecedents"
                placeholder="Maladies, opérations, traitements en cours…"></textarea>
            </div>
          </div>

          <div class="form-group">
            <label>Allergies connues</label>
            <div class="chip-input">
              @for (a of allergies; track a) {
                <span class="chip-tag">
                  {{ a }}
                  <button type="button" class="chip-x" (click)="removeAllergie(a)" aria-label="Retirer">
                    <svg [lucideIcon]="iconX" [size]="14"></svg>
                  </button>
                </span>
              }
              <input
                #allergieInput
                type="text"
                class="chip-add"
                placeholder="Ajouter une allergie puis Entrée…"
                (keydown.enter)="addAllergie(allergieInput.value); allergieInput.value = ''"
                (blur)="addAllergie(allergieInput.value); allergieInput.value = ''">
            </div>
            <small class="form-hint">Appuyez sur Entrée pour ajouter chaque allergie.</small>
          </div>
        </section>

        <!-- Sticky save -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="resetForm()" [disabled]="!form.dirty && !allergiesDirty">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
            @if (loading) {
              <span class="spinner"></span> Enregistrement…
            } @else {
              Enregistrer
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .profile-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }

    .card { padding: 0; overflow: hidden; }

    .identity-strip {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, #EBF3FF 0%, #F8FAFC 100%);
      border-bottom: 1px solid var(--gray-100);
    }
    .big-avatar {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1E6FD9, #1859B3);
      color: #fff; font-weight: 700; font-size: 1.85rem;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 18px rgba(30, 111, 217, 0.25);
      flex-shrink: 0;
    }
    .identity-strip h2 { font-size: 1.25rem; margin-bottom: 0.15rem; }

    .section { padding: 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .section:last-of-type { border-bottom: none; }
    .section h3 {
      font-size: 0.95rem; color: var(--gray-700);
      margin-bottom: 1.25rem; padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
      margin-bottom: 1rem;
    }
    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }

    .chip-input {
      display: flex; flex-wrap: wrap; gap: 0.5rem;
      padding: 0.625rem;
      background: var(--gray-50);
      border: 1.5px solid var(--gray-200);
      border-radius: 8px;
      min-height: 56px;
      align-items: center;
    }
    .chip-input:focus-within {
      border-color: var(--primary);
      background: #fff;
    }
    .chip-tag {
      display: inline-flex; align-items: center; gap: 0.25rem;
      padding: 0.3rem 0.5rem 0.3rem 0.75rem;
      background: #FEF3C7;
      color: #92400E;
      border-radius: 999px;
      font-size: 0.85rem; font-weight: 500;
    }
    .chip-x {
      background: transparent; border: none;
      padding: 0.15rem; cursor: pointer;
      color: #92400E;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%;
    }
    .chip-x:hover { background: rgba(146, 64, 14, 0.15); }
    .chip-add {
      flex: 1; min-width: 140px;
      border: none; background: transparent;
      padding: 0.3rem; font-size: 0.9rem;
      font-family: inherit;
      outline: none;
    }

    .form-actions {
      position: sticky; bottom: 0;
      background: #fff;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--gray-100);
      display: flex; justify-content: flex-end; gap: 0.75rem;
      z-index: 5;
    }
  `]
})
export class PatientProfileComponent implements OnInit {
  form: FormGroup;
  loading = false;
  initials = '';
  groupesSanguins = GROUPES_SANGUINS;
  allergies: string[] = [];
  allergiesDirty = false;
  readonly iconX = LucideX.icon;
  private original: Partial<{ allergies: string[] }> = {};

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private toast: MessageService,
  ) {
    this.form = this.fb.group({
      prenom:        ['', Validators.required],
      nom:           ['', Validators.required],
      email:         [{ value: '', disabled: false }],
      telephone:     [''],
      dateNaissance: [''],
      adresse:       [''],
      groupeSanguin: [''],
      antecedents:   [''],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.patientService.getProfile().subscribe({
      next: (patient) => {
        this.applyPatient(patient);
      }
    });
  }

  private applyPatient(p: any): void {
    this.form.reset({
      prenom: p.prenom ?? '',
      nom: p.nom ?? '',
      email: p.email ?? '',
      telephone: p.telephone ?? '',
      dateNaissance: p.dateNaissance ?? '',
      adresse: p.adresse ?? '',
      groupeSanguin: p.groupeSanguin ?? '',
      antecedents: p.antecedents ?? '',
    });
    this.initials = ((p.prenom?.[0] ?? '') + (p.nom?.[0] ?? '')).toUpperCase();
    this.allergies = (p.allergies ?? '')
      .split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean);
    this.original = { allergies: [...this.allergies] };
    this.allergiesDirty = false;
  }

  addAllergie(value: string): void {
    const v = value?.trim();
    if (!v) return;
    if (this.allergies.includes(v)) return;
    this.allergies.push(v);
    this.allergiesDirty = true;
  }

  removeAllergie(a: string): void {
    this.allergies = this.allergies.filter(x => x !== a);
    this.allergiesDirty = true;
  }

  resetForm(): void {
    this.loadProfile();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const payload = {
      ...this.form.getRawValue(),
      allergies: this.allergies.join(', '),
    };

    this.patientService.updateProfile(payload).subscribe({
      next: () => {
        this.loading = false;
        this.form.markAsPristine();
        this.allergiesDirty = false;
        this.original = { allergies: [...this.allergies] };
        this.toast.add({
          severity: 'success',
          summary: 'Profil mis à jour',
          detail: 'Vos informations ont été enregistrées.',
        });
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.error || 'Erreur lors de la mise à jour.';
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: msg });
      }
    });
  }
}
