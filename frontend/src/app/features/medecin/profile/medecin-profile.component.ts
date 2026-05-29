import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MedecinService } from '../../../core/services/medecin.service';
import { Medecin } from '../../../core/models/user.model';
import { SpecialiteLabelPipe } from '../../../shared/pipes/specialite-label.pipe';
import { PrixMadPipe } from '../../../shared/pipes/prix-mad.pipe';

const LANGUES_OPTIONS = ['Arabe', 'Français', 'Anglais', 'Amazigh', 'Espagnol'];

@Component({
  selector: 'app-medecin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, SpecialiteLabelPipe, PrixMadPipe],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="profile-page">
      <header class="page-header">
        <div>
          <h1>Mon profil</h1>
          <p class="text-muted">Gérez vos informations professionnelles et votre tarification.</p>
        </div>
      </header>

      @if (loading) {
        <div class="card text-center">
          <div class="spinner" style="margin: 2rem auto; width: 2.5rem; height: 2.5rem; border-color: var(--primary); border-top-color: transparent;"></div>
        </div>
      } @else {
        <div class="profile-grid">
          <!-- Colonne gauche : carte d'identité -->
          <aside class="identity-card card">
            <div class="big-avatar">{{ initials }}</div>
            <h2>Dr. {{ medecin?.prenom }} {{ medecin?.nom }}</h2>
            <p class="role-line">
              <span class="badge badge-primary">{{ medecin?.specialite | specialiteLabel }}</span>
            </p>
            <ul class="meta-list">
              <li>
                <span class="meta-label">Tarif</span>
                <strong class="meta-value primary">{{ medecin?.tarifConsultation | prixMad }}</strong>
              </li>
              <li>
                <span class="meta-label">Durée</span>
                <strong class="meta-value">{{ medecin?.dureeConsultation }} min</strong>
              </li>
              <li>
                <span class="meta-label">N° ordre</span>
                <strong class="meta-value">{{ medecin?.numeroOrdre || '—' }}</strong>
              </li>
              <li>
                <span class="meta-label">Note</span>
                <strong class="meta-value">
                  ★ {{ medecin?.noteMoyenne?.toFixed(1) || '0.0' }}
                  <small class="text-muted">({{ medecin?.nombreAvis || 0 }})</small>
                </strong>
              </li>
            </ul>
          </aside>

          <!-- Colonne droite : formulaire -->
          <form class="card" [formGroup]="form" (ngSubmit)="onSubmit()">
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
                <input type="email" class="form-control" [value]="medecin?.email" disabled>
                <small class="form-hint">L'email ne peut pas être modifié.</small>
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" class="form-control" formControlName="telephone" placeholder="06 00 00 00 00">
              </div>
            </div>

            <h3 class="mt-6">Profil professionnel</h3>
            <div class="form-group">
              <label>Biographie / description</label>
              <textarea class="form-control" rows="4" formControlName="description"
                        placeholder="Présentez-vous aux patients (parcours, approche, expertise...)"></textarea>
            </div>

            <div class="form-group">
              <label>Langues parlées</label>
              <div class="chip-multiselect">
                @for (lang of languesOptions; track lang) {
                  <button type="button"
                          class="chip"
                          [class.selected]="isLangueSelected(lang)"
                          (click)="toggleLangue(lang)">
                    {{ lang }}
                  </button>
                }
              </div>
              <small class="form-hint">Cliquez pour activer/désactiver une langue.</small>
            </div>

            <h3 class="mt-6">Tarification & disponibilité</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Tarif de consultation *</label>
                <div class="input-with-suffix">
                  <input type="number" class="form-control" formControlName="tarifConsultation" min="150" step="10">
                  <span class="suffix">DH</span>
                </div>
                @if (form.get('tarifConsultation')?.invalid && form.get('tarifConsultation')?.touched) {
                  <small class="error-message">Le tarif minimum réglementaire est de 150 DH.</small>
                }
              </div>
              <div class="form-group">
                <label>Durée d'une consultation</label>
                <div class="input-with-suffix">
                  <input type="number" class="form-control" formControlName="dureeConsultation" min="10" max="120" step="5">
                  <span class="suffix">min</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Horaires habituels</label>
              <input type="text" class="form-control" formControlName="horaires"
                     placeholder="Lun-Ven 09:00-17:00">
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="resetForm()" [disabled]="!form.dirty || saving">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || !form.dirty || saving">
                @if (saving) {
                  <span class="spinner"></span> Enregistrement...
                } @else {
                  Enregistrer les modifications
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }

    .profile-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      .profile-grid { grid-template-columns: 1fr; }
    }

    .identity-card {
      display: flex; flex-direction: column; align-items: center;
      text-align: center;
      gap: 0.5rem;
      position: sticky; top: 84px;
      align-self: start;
    }
    .big-avatar {
      width: 96px; height: 96px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1E6FD9 0%, #1859B3 100%);
      color: #fff; font-weight: 700; font-size: 2rem;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 0.75rem;
      box-shadow: 0 6px 20px rgba(30, 111, 217, 0.25);
    }
    .identity-card h2 { font-size: 1.125rem; margin-bottom: 0.25rem; }
    .role-line { margin-bottom: 1rem; }

    .meta-list {
      list-style: none; width: 100%; padding: 0;
      border-top: 1px solid var(--gray-100);
      margin-top: 0.5rem;
    }
    .meta-list li {
      display: flex; justify-content: space-between; align-items: baseline;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--gray-100);
    }
    .meta-list li:last-child { border-bottom: none; }
    .meta-label { color: var(--gray-500); font-size: 0.8rem; }
    .meta-value { font-size: 0.95rem; color: var(--gray-800); }
    .meta-value.primary { color: var(--primary); font-size: 1.05rem; }

    h3 { font-size: 0.95rem; color: var(--gray-700); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--gray-100); }

    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
    }
    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }

    .input-with-suffix {
      position: relative;
    }
    .input-with-suffix .form-control { padding-right: 3rem; }
    .input-with-suffix .suffix {
      position: absolute; right: 0.875rem; top: 50%; transform: translateY(-50%);
      color: var(--gray-500); font-weight: 600; font-size: 0.875rem;
      pointer-events: none;
    }

    .chip-multiselect {
      display: flex; flex-wrap: wrap; gap: 0.5rem;
      padding: 0.5rem;
      background: var(--gray-50);
      border-radius: 8px;
      border: 1px solid var(--gray-100);
    }
    .chip {
      padding: 0.4rem 0.875rem;
      border: 1.5px solid var(--gray-200);
      background: #fff;
      border-radius: 999px;
      font-size: 0.85rem; font-weight: 500;
      color: var(--gray-700);
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }
    .chip:hover { border-color: var(--primary); color: var(--primary); }
    .chip.selected {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }

    .form-actions {
      position: sticky; bottom: 0;
      background: #fff;
      margin: 2rem -1.5rem -1.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--gray-100);
      display: flex; justify-content: flex-end; gap: 0.75rem;
      border-radius: 0 0 12px 12px;
    }
  `]
})
export class MedecinProfileComponent implements OnInit {
  form: FormGroup;
  medecin: Medecin | null = null;
  loading = true;
  saving = false;
  initials = '';
  languesOptions = LANGUES_OPTIONS;
  selectedLangues = new Set<string>();

  constructor(
    private fb: FormBuilder,
    private medecinService: MedecinService,
    private toast: MessageService,
  ) {
    this.form = this.fb.group({
      prenom:             ['', [Validators.required, Validators.minLength(2)]],
      nom:                ['', [Validators.required, Validators.minLength(2)]],
      telephone:          [''],
      description:        [''],
      tarifConsultation:  [150, [Validators.required, Validators.min(150)]],
      dureeConsultation:  [30, [Validators.required, Validators.min(10), Validators.max(120)]],
      horaires:           [''],
    });
  }

  ngOnInit(): void {
    this.medecinService.getProfile().subscribe({
      next: (m) => {
        this.medecin = m;
        this.applyMedecin(m);
        this.loading = false;
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger votre profil.' });
        this.loading = false;
      }
    });
  }

  private applyMedecin(m: Medecin): void {
    this.initials = `${m.prenom?.[0] ?? ''}${m.nom?.[0] ?? ''}`.toUpperCase();
    this.form.reset({
      prenom: m.prenom,
      nom: m.nom,
      telephone: m.telephone ?? '',
      description: m.description ?? '',
      tarifConsultation: m.tarifConsultation ?? 150,
      dureeConsultation: m.dureeConsultation ?? 30,
      horaires: m.horaires ?? '',
    });
    this.selectedLangues = new Set(
      (m.languesParlees ?? '').split(',').map(s => s.trim()).filter(Boolean)
    );
  }

  isLangueSelected(lang: string): boolean {
    return this.selectedLangues.has(lang);
  }

  toggleLangue(lang: string): void {
    if (this.selectedLangues.has(lang)) this.selectedLangues.delete(lang);
    else this.selectedLangues.add(lang);
    this.form.markAsDirty();
  }

  resetForm(): void {
    if (this.medecin) this.applyMedecin(this.medecin);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const payload: Partial<Medecin> = {
      ...this.form.value,
      languesParlees: Array.from(this.selectedLangues).join(', '),
    };

    this.medecinService.updateProfile(payload).subscribe({
      next: (updated) => {
        this.medecin = updated;
        this.applyMedecin(updated);
        this.form.markAsPristine();
        this.saving = false;
        this.toast.add({ severity: 'success', summary: 'Profil mis à jour', detail: 'Vos modifications ont été enregistrées.' });
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message || 'Impossible d\'enregistrer les modifications.';
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: msg });
      }
    });
  }
}
