import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputTextModule, ButtonModule, ToastModule],
  template: `
    <div class="register-page">
      <div class="register-container animate-slideUp">
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#1E6FD9"/>
              <path d="M24 12V36M12 24H36" stroke="white" stroke-width="4" stroke-linecap="round"/>
            </svg>
          </div>
          <h1>Creer un compte</h1>
          <p>Rejoignez MediSync pour gerer votre sante</p>
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

        <!-- Google OAuth Button -->
        <button type="button" class="btn-google" (click)="registerWithGoogle()">
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>S'inscrire avec Google</span>
        </button>

        <!-- Divider -->
        <div class="divider">ou</div>

        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label for="prenom">Prenom</label>
              <div class="input-group has-icon-left">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="5"/>
                    <path d="M20 21a8 8 0 0 0-16 0"/>
                  </svg>
                </span>
                <input type="text" id="prenom" pInputText class="form-control" formControlName="prenom" placeholder="Votre prenom">
              </div>
            </div>
            <div class="form-group">
              <label for="nom">Nom</label>
              <div class="input-group has-icon-left">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="5"/>
                    <path d="M20 21a8 8 0 0 0-16 0"/>
                  </svg>
                </span>
                <input type="text" id="nom" pInputText class="form-control" formControlName="nom" placeholder="Votre nom">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Adresse email</label>
            <div class="input-group has-icon-left">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input type="email" id="email" pInputText class="form-control" formControlName="email" placeholder="votre@email.com">
            </div>
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <span class="error-message">Veuillez entrer une adresse email valide</span>
            }
          </div>

          <div class="form-group">
            <label for="telephone">Telephone</label>
            <div class="input-group has-icon-left">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <input type="tel" id="telephone" pInputText class="form-control" formControlName="telephone" placeholder="06XX-XXX-XXX">
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <div class="input-group has-icon-left has-icon-right">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                pInputText class="form-control"
                formControlName="password"
                placeholder="Minimum 8 caracteres"
                (input)="updatePasswordStrength()"
              >
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

            <!-- Password Strength Indicator -->
            <div class="password-strength">
              <div class="strength-bars">
                <div class="bar" [class.active]="passwordStrength >= 1" [class.weak]="passwordStrength === 1" [class.medium]="passwordStrength === 2" [class.strong]="passwordStrength >= 3"></div>
                <div class="bar" [class.active]="passwordStrength >= 2" [class.medium]="passwordStrength === 2" [class.strong]="passwordStrength >= 3"></div>
                <div class="bar" [class.active]="passwordStrength >= 3" [class.strong]="passwordStrength >= 3"></div>
                <div class="bar" [class.active]="passwordStrength >= 4" [class.strong]="passwordStrength >= 4"></div>
              </div>
              <span class="strength-text" [class]="strengthClass">{{ strengthText }}</span>
            </div>

            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <span class="error-message">Min 8 caracteres, 1 majuscule, 1 chiffre, 1 caractere special</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="dateNaissance">Date de naissance</label>
              <div class="input-group has-icon-left">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 2v4"/>
                    <path d="M16 2v4"/>
                    <rect width="18" height="18" x="3" y="4" rx="2"/>
                    <path d="M3 10h18"/>
                  </svg>
                </span>
                <input type="date" id="dateNaissance" pInputText class="form-control" formControlName="dateNaissance">
              </div>
            </div>
            <div class="form-group">
              <label for="ville">Ville</label>
              <div class="input-group has-icon-left">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <select id="ville" pInputText class="form-control" formControlName="ville">
                  <option value="">Selectionnez...</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Fes">Fes</option>
                  <option value="Tanger">Tanger</option>
                  <option value="Agadir">Agadir</option>
                  <option value="Meknes">Meknes</option>
                  <option value="Oujda">Oujda</option>
                  <option value="Kenitra">Kenitra</option>
                  <option value="Tetouan">Tetouan</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="adresse">Adresse</label>
            <div class="input-group has-icon-left">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </span>
              <input type="text" id="adresse" pInputText class="form-control" formControlName="adresse" placeholder="Votre adresse complete">
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg btn-block"
            [disabled]="loading || registerForm.invalid"
          >
            @if (loading) {
              <span class="spinner"></span>
              <span>Inscription en cours...</span>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              <span>Creer mon compte</span>
            }
          </button>
        </form>

        <!-- Login Link -->
        <p class="login-link">
          Deja un compte ?
          <a routerLink="/login">Se connecter</a>
        </p>
      </div>

      <!-- Background Decoration -->
      <div class="bg-decoration">
        <div class="bg-circle bg-circle-1"></div>
        <div class="bg-circle bg-circle-2"></div>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e8f1fc 100%);
      position: relative;
      overflow: hidden;
    }

    .register-container {
      width: 100%;
      max-width: 520px;
      background: var(--white);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      padding: 2.5rem;
      position: relative;
      z-index: 1;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 1.5rem;

      .logo {
        display: inline-flex;
        margin-bottom: 1rem;
      }

      h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gray-900);
        margin-bottom: 0.25rem;
      }

      p {
        color: var(--gray-500);
        font-size: 0.9375rem;
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

      span {
        color: var(--gray-700);
      }
    }

    .register-form {
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
    }

    .password-strength {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.5rem;

      .strength-bars {
        display: flex;
        gap: 4px;
        flex: 1;

        .bar {
          height: 4px;
          flex: 1;
          background: var(--gray-200);
          border-radius: 2px;
          transition: all 0.3s;

          &.active.weak {
            background: #EF4444;
          }

          &.active.medium {
            background: #F59E0B;
          }

          &.active.strong {
            background: #10B981;
          }
        }
      }

      .strength-text {
        font-size: 0.75rem;
        font-weight: 500;
        min-width: 60px;

        &.weak { color: #EF4444; }
        &.medium { color: #F59E0B; }
        &.strong { color: #10B981; }
      }
    }

    .login-link {
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
      top: -150px;
      right: -100px;
    }

    .bg-circle-2 {
      width: 300px;
      height: 300px;
      bottom: -100px;
      left: -100px;
    }

    @media (max-width: 640px) {
      .register-container {
        padding: 1.5rem;
      }

      .register-form .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  passwordStrength = 0;
  strengthText = '';
  strengthClass = '';

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
      ville: [''],
      adresse: ['']
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  updatePasswordStrength(): void {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    this.passwordStrength = strength;

    if (strength === 0) {
      this.strengthText = '';
      this.strengthClass = '';
    } else if (strength <= 1) {
      this.strengthText = 'Faible';
      this.strengthClass = 'weak';
    } else if (strength <= 2) {
      this.strengthText = 'Moyen';
      this.strengthClass = 'medium';
    } else {
      this.strengthText = 'Fort';
      this.strengthClass = 'strong';
    }
  }

  registerWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
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
