import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#1E6FD9"/>
            <path d="M24 12V36M12 24H36" stroke="white" stroke-width="4" stroke-linecap="round"/>
          </svg>
        </div>
        @if (!collapsed) {
          <span class="logo-text">MediSync</span>
        }
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.route === '' }"
            class="nav-item"
            [title]="collapsed ? item.label : ''"
          >
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            @if (!collapsed) {
              <span class="nav-label">{{ item.label }}</span>
              @if (item.badge) {
                <span class="nav-badge">{{ item.badge }}</span>
              }
            }
          </a>
        }
      </nav>

      <!-- User Section -->
      <div class="sidebar-footer">
        <div class="user-info" [class.collapsed]="collapsed">
          <div class="avatar avatar-md">
            {{ userInitials }}
          </div>
          @if (!collapsed) {
            <div class="user-details">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">{{ userRole }}</span>
            </div>
          }
        </div>

        <button class="logout-btn" (click)="logout()" [title]="collapsed ? 'Deconnexion' : ''">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          @if (!collapsed) {
            <span>Deconnexion</span>
          }
        </button>
      </div>

      <!-- Toggle Button -->
      <button class="collapse-btn" (click)="toggleCollapse()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [style.transform]="collapsed ? 'rotate(180deg)' : ''">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: var(--sidebar-width);
      background: var(--white);
      border-right: 1px solid var(--gray-200);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      z-index: 100;

      &.collapsed {
        width: 80px;
      }
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      border-bottom: 1px solid var(--gray-100);

      .logo-icon {
        flex-shrink: 0;
      }

      .logo-text {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--gray-900);
        white-space: nowrap;
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
      position: relative;

      &:hover {
        background: var(--gray-50);
        color: var(--gray-900);
      }

      &.active {
        background: var(--primary-light);
        color: var(--primary);
        font-weight: 500;

        .nav-icon {
          color: var(--primary);
        }
      }

      .nav-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;

        :host ::ng-deep svg {
          width: 20px;
          height: 20px;
        }
      }

      .nav-label {
        white-space: nowrap;
        overflow: hidden;
      }

      .nav-badge {
        margin-left: auto;
        background: var(--primary);
        color: var(--white);
        font-size: 0.6875rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: var(--radius-full);
      }
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--gray-100);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--gray-50);
      border-radius: var(--radius-md);
      margin-bottom: 0.75rem;

      &.collapsed {
        justify-content: center;
        padding: 0.5rem;
      }

      .user-details {
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
          text-transform: capitalize;
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

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
        position: relative;
        border-right: none;
        border-bottom: 1px solid var(--gray-200);

        &.collapsed {
          width: 100%;
        }
      }

      .sidebar-nav {
        display: flex;
        flex-wrap: wrap;
        padding: 0.5rem;
      }

      .nav-item {
        flex: 1;
        min-width: 80px;
        justify-content: center;
        text-align: center;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem;

        .nav-label {
          font-size: 0.6875rem;
        }

        .nav-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
        }
      }

      .sidebar-footer,
      .collapse-btn {
        display: none;
      }

      .sidebar-logo {
        padding: 1rem;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() navItems: NavItem[] = [];
  collapsed = false;

  userName = '';
  userRole = '';
  userInitials = '';

  constructor(private authService: AuthService) {
    const user = this.authService.user();
    if (user) {
      this.userName = `${user.prenom} ${user.nom}`;
      this.userRole = user.role?.toLowerCase() || '';
      this.userInitials = `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
    }
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}
