import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Inscription</h1>
          <p>Creez votre compte patient</p>
        </div>

        @if (error) {
          <div class="alert alert-danger">{{ error }}</div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label for="prenom">Prenom</label>
              <input type="text" id="prenom" formControlName="prenom">
            </div>
            <div class="form-group">
              <label for="nom">Nom</label>
              <input type="text" id="nom" formControlName="nom">
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" formControlName="email">
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <span class="error-message">Email invalide</span>
            }
          </div>

          <div class="form-group">
            <label for="telephone">Telephone</label>
            <input type="tel" id="telephone" formControlName="telephone">
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" formControlName="password">
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <span class="error-message">Min 8 caracteres, 1 majuscule, 1 chiffre, 1 special</span>
            }
          </div>

          <div class="form-group">
            <label for="dateNaissance">Date de naissance</label>
            <input type="date" id="dateNaissance" formControlName="dateNaissance">
          </div>

          <div class="form-group">
            <label for="adresse">Adresse</label>
            <input type="text" id="adresse" formControlName="adresse">
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading || registerForm.invalid">
            {{ loading ? 'Inscription...' : 'S\\'inscrire' }}
          </button>
        </form>

        <p class="auth-footer">
          Deja un compte ? <a routerLink="/login">Se connecter</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .auth-card {
      width: 100%;
      max-width: 500px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        font-size: 1.5rem;
        font-weight: 700;
      }

      p {
        color: var(--gray-500);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .btn-block {
      width: 100%;
      margin-top: 1rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--gray-500);

      a {
        color: var(--primary);
        text-decoration: none;
        font-weight: 500;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      dateNaissance: [''],
      adresse: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/patient']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}
