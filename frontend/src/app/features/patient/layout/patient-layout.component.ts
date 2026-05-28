import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <!-- Logo -->
        <div class="sidebar-header">
          <a routerLink="/" class="logo">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="10" fill="#1E6FD9"/>
              <path d="M24 14V34M14 24H34" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
            </svg>
            @if (!sidebarCollapsed) {
              <span>MediSync</span>
            }
          </a>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <a routerLink="/patient" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            @if (!sidebarCollapsed) {
              <span>Accueil</span>
            }
          </a>

          <a routerLink="/patient/appointments" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4"/>
              <path d="M16 2v4"/>
              <rect width="18" height="18" x="3" y="4" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
            @if (!sidebarCollapsed) {
              <span>Mes RDV</span>
            }
          </a>

          <a routerLink="/patient/medical-record" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M16 13H8"/>
              <path d="M16 17H8"/>
              <path d="M10 9H8"/>
            </svg>
            @if (!sidebarCollapsed) {
              <span>Mon dossier</span>
            }
          </a>

          <a routerLink="/patient/prescriptions" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
              <path d="m8.5 8.5 7 7"/>
            </svg>
            @if (!sidebarCollapsed) {
              <span>Ordonnances</span>
            }
          </a>

          <a routerLink="/patient/profile" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="5"/>
              <path d="M20 21a8 8 0 0 0-16 0"/>
            </svg>
            @if (!sidebarCollapsed) {
              <span>Mon profil</span>
            }
          </a>

          <div class="nav-divider"></div>

          <a routerLink="/medecins" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            @if (!sidebarCollapsed) {
              <span>Trouver un medecin</span>
            }
          </a>
        </nav>

        <!-- User Section -->
        <div class="sidebar-footer">
          <div class="user-card">
            <div class="avatar">{{ userInitials }}</div>
            @if (!sidebarCollapsed) {
              <div class="user-info">
                <span class="user-name">{{ userName }}</span>
                <span class="user-role">Patient</span>
              </div>
            }
          </div>

          <button class="logout-btn" (click)="logout()" [title]="sidebarCollapsed ? 'Deconnexion' : ''">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            @if (!sidebarCollapsed) {
              <span>Deconnexion</span>
            }
          </button>
        </div>

        <!-- Collapse Toggle -->
        <button class="collapse-btn" (click)="toggleSidebar()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [style.transform]="sidebarCollapsed ? 'rotate(180deg)' : ''">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <button class="mobile-menu-btn" (click)="toggleSidebar()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"/>
                <line x1="4" x2="20" y1="6" y2="6"/>
                <line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="header-right">
            <button class="notification-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
      background: var(--gray-50);
    }

    // Sidebar
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 260px;
      background: var(--white);
      border-right: 1px solid var(--gray-200);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      z-index: 100;

      &.collapsed {
        width: 72px;

        .sidebar-header .logo span,
        .nav-item span,
        .user-info,
        .logout-btn span {
          display: none;
        }

        .nav-item {
          justify-content: center;
          padding: 0.875rem;
        }

        .user-card {
          justify-content: center;
        }

        .logout-btn {
          justify-content: center;
        }
      }
    }

    .sidebar-header {
      padding: 1.25rem;
      border-bottom: 1px solid var(--gray-100);

      .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;

        span {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gray-900);
        }
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--gray-600);
      text-decoration: none;
      border-radius: var(--radius-md);
      margin-bottom: 0.25rem;
      transition: all 0.2s;
      font-weight: 500;
      font-size: 0.9375rem;

      svg {
        flex-shrink: 0;
      }

      &:hover {
        background: var(--gray-50);
        color: var(--gray-900);
      }

      &.active {
        background: var(--primary-light);
        color: var(--primary);
      }
    }

    .nav-divider {
      height: 1px;
      background: var(--gray-200);
      margin: 1rem 0;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--gray-100);
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--gray-50);
      border-radius: var(--radius-md);
      margin-bottom: 0.75rem;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        background: var(--primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        flex-shrink: 0;
      }

      .user-info {
        overflow: hidden;

        .user-name {
          display: block;
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--gray-900);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-500);
        }
      }
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem;
      background: transparent;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      color: var(--gray-600);
      font-size: 0.875rem;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #FEE2E2;
        border-color: #FECACA;
        color: var(--danger);
      }
    }

    .collapse-btn {
      position: absolute;
      top: 50%;
      right: -12px;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--gray-500);
      transition: all 0.2s;
      box-shadow: var(--shadow-sm);

      &:hover {
        background: var(--gray-50);
        color: var(--gray-700);
      }

      svg {
        transition: transform 0.3s;
      }
    }

    // Main Content
    .main-content {
      flex: 1;
      margin-left: 260px;
      transition: margin-left 0.3s;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .sidebar.collapsed + .main-content {
      margin-left: 72px;
    }

    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--white);
      border-bottom: 1px solid var(--gray-100);
      position: sticky;
      top: 0;
      z-index: 50;

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

      .notification-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--gray-50);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-md);
        color: var(--gray-600);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--gray-100);
          color: var(--gray-900);
        }
      }
    }

    .page-content {
      flex: 1;
      padding: 1.5rem;
    }

    // Responsive
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);

        &.collapsed {
          transform: translateX(0);
          width: 260px;
        }
      }

      .main-content {
        margin-left: 0 !important;
      }

      .collapse-btn {
        display: none;
      }
    }
  `]
})
export class PatientLayoutComponent {
  sidebarCollapsed = false;
  userName = '';
  userInitials = '';

  constructor(private authService: AuthService) {
    const user = this.authService.user();
    if (user) {
      this.userName = `${user.prenom} ${user.nom}`;
      this.userInitials = `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}
