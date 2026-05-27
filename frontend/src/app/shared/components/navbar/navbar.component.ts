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
          <span class="logo-icon">+</span>
          MediSync
        </a>

        <div class="nav-links">
          <a routerLink="/medecins" routerLinkActive="active">Medecins</a>

          @if (!isAuthenticated()) {
            <a routerLink="/login" class="btn btn-secondary">Connexion</a>
            <a routerLink="/register" class="btn btn-primary">Inscription</a>
          } @else {
            <a [routerLink]="dashboardLink()" routerLinkActive="active">Mon espace</a>
            <button (click)="logout()" class="btn btn-secondary">Deconnexion</button>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--primary);
      color: white;
      border-radius: 8px;
      font-size: 1.5rem;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;

      a:not(.btn) {
        color: var(--gray-600);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;

        &:hover, &.active {
          color: var(--primary);
        }
      }
    }
  `]
})
export class NavbarComponent {
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

  logout(): void {
    this.authService.logout();
  }
}
