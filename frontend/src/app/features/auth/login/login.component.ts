import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Connexion</h1>
          <p>Bienvenue sur MediSync</p>
        </div>

        @if (error) {
          <div class="alert alert-danger">{{ error }}</div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" formControlName="email" placeholder="votre@email.com">
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <span class="error-message">Email invalide</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" formControlName="password" placeholder="Votre mot de passe">
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <span class="error-message">Mot de passe requis</span>
            }
          </div>

          @if (requiresTwoFactor) {
            <div class="form-group">
              <label for="totpCode">Code 2FA</label>
              <input type="text" id="totpCode" formControlName="totpCode" placeholder="123456">
            </div>
          }

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading || loginForm.invalid">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <p class="auth-footer">
          Pas encore de compte ? <a routerLink="/register">S'inscrire</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 150px);
      padding: 2rem;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gray-900);
      }

      p {
        color: var(--gray-500);
        margin-top: 0.25rem;
      }
    }

    .btn-block {
      width: 100%;
      margin-top: 1rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--gray-500);
      font-size: 0.875rem;

      a {
        color: var(--primary);
        text-decoration: none;
        font-weight: 500;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  requiresTwoFactor = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      totpCode: ['']
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.requiresTwoFactor) {
          this.requiresTwoFactor = true;
          this.loading = false;
        } else {
          this.authService.redirectToDashboard();
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur de connexion';
        this.loading = false;
      }
    });
  }
}
