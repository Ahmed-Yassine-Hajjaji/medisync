import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="container navbar-content">
        <a routerLink="/" class="logo">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#1E6FD9"/>
            <path d="M24 14V34M14 24H34" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
          </svg>
          <span>MediSync</span>
        </a>

        <div class="nav-links">
          <a routerLink="/medecins" routerLinkActive="active" class="nav-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 20a6 6 0 0 0-12 0"/>
              <circle cx="12" cy="10" r="4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <span>Medecins</span>
          </a>

          @if (!isAuthenticated()) {
            <a routerLink="/login" class="btn btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Connexion
            </a>
            <a routerLink="/register" class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Inscription
            </a>
          } @else {
            <a [routerLink]="dashboardLink()" routerLinkActive="active" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1"/>
                <rect width="7" height="5" x="14" y="3" rx="1"/>
                <rect width="7" height="9" x="14" y="12" rx="1"/>
                <rect width="7" height="5" x="3" y="16" rx="1"/>
              </svg>
              <span>Mon espace</span>
            </a>
            <button (click)="logout()" class="btn btn-secondary btn-logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Deconnexion
            </button>
          }
        </div>

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen) {
        <div class="mobile-menu">
          <a routerLink="/medecins" routerLinkActive="active" (click)="closeMobileMenu()">Medecins</a>
          @if (!isAuthenticated()) {
            <a routerLink="/login" (click)="closeMobileMenu()">Connexion</a>
            <a routerLink="/register" (click)="closeMobileMenu()">Inscription</a>
          } @else {
            <a [routerLink]="dashboardLink()" (click)="closeMobileMenu()">Mon espace</a>
            <button (click)="logout(); closeMobileMenu()">Deconnexion</button>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--white);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid var(--gray-100);
    }

    .navbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.9;
      }

      span {
        font-size: 1.375rem;
        font-weight: 700;
        color: var(--gray-900);
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      @media (max-width: 768px) {
        display: none;
      }
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      color: var(--gray-600);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9375rem;
      border-radius: var(--radius-md);
      transition: all 0.2s;

      svg {
        transition: transform 0.2s;
      }

      &:hover {
        color: var(--primary);
        background: var(--primary-light);

        svg {
          transform: scale(1.1);
        }
      }

      &.active {
        color: var(--primary);
        background: var(--primary-light);
      }
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9375rem;
    }

    .btn-logout {
      &:hover {
        background: #FEE2E2;
        border-color: #FECACA;
        color: var(--danger);
      }
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      padding: 0.5rem;
      color: var(--gray-600);
      cursor: pointer;

      @media (max-width: 768px) {
        display: flex;
      }
    }

    .mobile-menu {
      display: none;
      padding: 1rem;
      background: var(--white);
      border-top: 1px solid var(--gray-100);

      @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      a, button {
        display: block;
        padding: 0.75rem 1rem;
        color: var(--gray-700);
        text-decoration: none;
        font-weight: 500;
        border-radius: var(--radius-md);
        border: none;
        background: none;
        text-align: left;
        font-size: 1rem;
        cursor: pointer;
        width: 100%;

        &:hover, &.active {
          background: var(--primary-light);
          color: var(--primary);
        }
      }
    }
  `]
})
export class NavbarComponent {
  mobileMenuOpen = false;

  constructor(private authService: AuthService) {}

  isAuthenticated = computed(() => this.authService.isAuthenticated());

  dashboardLink = computed(() => {
    const role = this.authService.userRole();
    switch (role) {
      case 'PATIENT': return '/patient';
      case 'MEDECIN': return '/medecin';
      case 'SECRETAIRE': return '/secretaire';
      case 'ADMIN': return '/admin';
      default: return '/';
    }
  });

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
