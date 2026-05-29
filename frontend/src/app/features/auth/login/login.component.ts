import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputTextModule, ButtonModule, ToastModule, MessagesModule],
  template: `
    <div class="login-page">
      <div class="login-container animate-slideUp">
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#1E6FD9"/>
              <path d="M24 12V36M12 24H36" stroke="white" stroke-width="4" stroke-linecap="round"/>
            </svg>
          </div>
          <h1>MediSync</h1>
          <p>Votre plateforme de gestion medicale</p>
        </div>

        <!-- Error Alert -->
        @if (error) {
          <div class="alert alert-danger animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ error }}</span>
          </div>
        }

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Adresse email</label>
            <div class="input-group has-icon-left">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input
                pInputText
                type="email"
                id="email"
                class="form-control"
                formControlName="email"
                placeholder="votre@email.com"
                autocomplete="email"
              />
            </div>
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <span class="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Veuillez entrer une adresse email valide
              </span>
            }
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="password">Mot de passe</label>
              <a href="#" class="forgot-link">Mot de passe oublie ?</a>
            </div>
            <div class="input-group has-icon-left has-icon-right">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                pInputText
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                class="form-control"
                formControlName="password"
                placeholder="Votre mot de passe"
                autocomplete="current-password"
              />
              <button type="button" class="input-icon-right" (click)="togglePassword()">
                @if (showPassword) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                }
              </button>
            </div>
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <span class="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Le mot de passe est requis
              </span>
            }
          </div>

          <!-- 2FA Code -->
          @if (requiresTwoFactor) {
            <div class="form-group animate-slideUp">
              <label for="totpCode">Code de verification (2FA)</label>
              <div class="input-group has-icon-left">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="7" height="7" x="3" y="3" rx="1"/>
                    <rect width="7" height="7" x="14" y="3" rx="1"/>
                    <rect width="7" height="7" x="14" y="14" rx="1"/>
                    <rect width="7" height="7" x="3" y="14" rx="1"/>
                  </svg>
                </span>
                <input
                  pInputText
                  type="text"
                  id="totpCode"
                  class="form-control"
                  formControlName="totpCode"
                  placeholder="123456"
                  maxlength="6"
                />
              </div>
            </div>
          }

          <button
            type="submit"
            class="btn btn-primary btn-lg btn-block"
            [disabled]="loading || loginForm.invalid"
          >
            @if (loading) {
              <span class="spinner"></span>
              <span>Connexion en cours...</span>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>Se connecter</span>
            }
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">ou</div>

        <!-- Google OAuth Button -->
        <button type="button" class="btn-google" (click)="loginWithGoogle()">
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continuer avec Google</span>
        </button>

        <!-- Register Link -->
        <p class="register-link">
          Pas encore de compte ?
          <a routerLink="/register">Creer un compte</a>
        </p>
      </div>

      <!-- Background Decoration -->
      <div class="bg-decoration">
        <div class="bg-circle bg-circle-1"></div>
        <div class="bg-circle bg-circle-2"></div>
        <div class="bg-circle bg-circle-3"></div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e8f1fc 100%);
      position: relative;
      overflow: hidden;
    }

    .login-container {
      width: 100%;
      max-width: 420px;
      background: var(--white);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      padding: 2.5rem;
      position: relative;
      z-index: 1;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 2rem;

      .logo {
        display: inline-flex;
        margin-bottom: 1rem;
      }

      h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--gray-900);
        margin-bottom: 0.25rem;
      }

      p {
        color: var(--gray-500);
        font-size: 0.9375rem;
      }
    }

    .login-form {
      margin-bottom: 1.5rem;

      .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        label {
          margin-bottom: 0;
        }
      }

      .forgot-link {
        font-size: 0.8125rem;
        color: var(--primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .btn-google {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.875rem 1.5rem;
      font-size: 0.9375rem;
      font-weight: 500;
      font-family: inherit;
      background: var(--white);
      border: 1.5px solid var(--gray-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--gray-50);
        border-color: var(--gray-300);
        box-shadow: var(--shadow-sm);
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2);
      }

      span {
        color: var(--gray-700);
      }
    }

    .register-link {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--gray-500);
      font-size: 0.9375rem;

      a {
        color: var(--primary);
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    // Background decoration
    .bg-decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .bg-circle {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(30, 111, 217, 0.1) 0%, rgba(30, 111, 217, 0.05) 100%);
    }

    .bg-circle-1 {
      width: 400px;
      height: 400px;
      top: -100px;
      right: -100px;
    }

    .bg-circle-2 {
      width: 300px;
      height: 300px;
      bottom: -50px;
      left: -50px;
    }

    .bg-circle-3 {
      width: 200px;
      height: 200px;
      top: 50%;
      left: 10%;
      opacity: 0.5;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 1.5rem;
      }

      .logo-section h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  requiresTwoFactor = false;
  showPassword = false;

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

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
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
        this.error = err.error?.error || 'Identifiants incorrects. Veuillez reessayer.';
        this.loading = false;
      }
    });
  }
}
