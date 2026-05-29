import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideIconData,
  LucideHome,
  LucideCalendar,
  LucideFileText,
  LucidePill,
  LucideUser,
  LucideUsers,
  LucideSearch,
  LucideFilePenLine,
  LucideBarChart3,
  LucidePieChart,
  LucideReceipt,
  LucideClock,
  LucideDoorOpen,
  LucideShield,
  LucideStethoscope,
  LucideBriefcase,
  LucideSettings,
  LucideLogOut,
  LucideMenu,
  LucideBell,
  LucideChevronLeft,
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Mapping clé → données d'icône Lucide. Utilisé par les items de navigation
 * pour résoudre l'icône à partir du nom court déclaré dans les routes.
 */
const ICON_MAP: Record<string, LucideIconData> = {
  home: LucideHome.icon,
  calendar: LucideCalendar.icon,
  fileText: LucideFileText.icon,
  prescription: LucidePill.icon,
  user: LucideUser.icon,
  users: LucideUsers.icon,
  search: LucideSearch.icon,
  fileEdit: LucideFilePenLine.icon,
  chart: LucideBarChart3.icon,
  pieChart: LucidePieChart.icon,
  invoice: LucideReceipt.icon,
  clock: LucideClock.icon,
  door: LucideDoorOpen.icon,
  shield: LucideShield.icon,
  stethoscope: LucideStethoscope.icon,
  briefcase: LucideBriefcase.icon,
  settings: LucideSettings.icon,
};

export type IconKey = keyof typeof ICON_MAP;

export interface RoleNavItem {
  route: string;
  label: string;
  icon: IconKey;
  exact?: boolean;
}

@Component({
  selector: 'app-role-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, LucideDynamicIcon],
  template: `
    <div class="layout" [class.sidebar-open]="mobileOpen">
      <aside class="sidebar sidebar-shadow" [class.collapsed]="collapsed">
        <!-- Logo -->
        <div class="sidebar-header">
          <a routerLink="/" class="logo">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="10" fill="#1E6FD9"/>
              <path d="M24 14V34M14 24H34" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
            </svg>
            @if (!collapsed) {<span>MediSync</span>}
          </a>
        </div>

        <!-- User card en haut -->
        <div class="user-card">
          <div class="avatar-block">{{ initials }}</div>
          @if (!collapsed) {
            <div class="user-info">
              <span class="user-name">{{ displayName }}</span>
              <span class="user-role">{{ roleLabel }}</span>
            </div>
          }
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: !!item.exact }"
              class="nav-item"
              [title]="collapsed ? item.label : ''">
              <svg [lucideIcon]="iconFor(item.icon)" [size]="20" class="nav-icon"></svg>
              @if (!collapsed) {<span>{{ item.label }}</span>}
            </a>
          }

          @if (extraSearch) {
            <div class="nav-divider"></div>
            <a [routerLink]="extraSearch.route" class="nav-item" [title]="collapsed ? extraSearch.label : ''">
              <svg [lucideIcon]="searchIcon" [size]="20" class="nav-icon"></svg>
              @if (!collapsed) {<span>{{ extraSearch.label }}</span>}
            </a>
          }
        </nav>

        <!-- Logout -->
        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()" [title]="collapsed ? 'Déconnexion' : ''">
            <svg [lucideIcon]="logoutIcon" [size]="20"></svg>
            @if (!collapsed) {<span>Déconnexion</span>}
          </button>
        </div>

        <!-- Collapse toggle (desktop) -->
        <button class="collapse-btn" (click)="toggleCollapse()" aria-label="Réduire">
          <svg [lucideIcon]="chevronIcon" [size]="18"
            [style.transform]="collapsed ? 'rotate(180deg)' : ''"></svg>
        </button>
      </aside>

      <!-- Overlay mobile -->
      @if (mobileOpen) {
        <div class="mobile-overlay" (click)="closeMobile()"></div>
      }

      <main class="main-content">
        <header class="top-header">
          <button class="mobile-menu-btn" (click)="toggleMobile()" aria-label="Menu">
            <svg [lucideIcon]="menuIcon" [size]="24"></svg>
          </button>
          <div class="header-title">{{ pageTitle }}</div>
          <button class="notification-btn" aria-label="Notifications">
            <svg [lucideIcon]="bellIcon" [size]="20"></svg>
          </button>
        </header>

        <div class="page-content">
          <div class="page-container">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: var(--app-bg); }

    .sidebar {
      position: fixed; top: 0; left: 0; height: 100vh;
      width: 240px; background: #FFFFFF;
      display: flex; flex-direction: column;
      transition: width 0.3s ease, transform 0.3s ease;
      z-index: 100;

      &.collapsed { width: 72px; }
      &.collapsed .user-card { justify-content: center; }
      &.collapsed .nav-item { justify-content: center; padding: 0.75rem; }
      &.collapsed .logout-btn { justify-content: center; padding: 0.6rem; }
    }

    .sidebar-header { padding: 1.25rem; border-bottom: 1px solid var(--gray-100); }
    .logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
    .logo span { font-size: 1.125rem; font-weight: 700; color: var(--gray-900); }

    .user-card {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--gray-100);
    }
    .avatar-block {
      width: 38px; height: 38px; flex-shrink: 0;
      border-radius: 10px;
      background: var(--primary); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.85rem;
    }
    .user-info { overflow: hidden; }
    .user-name {
      display: block; font-weight: 600; font-size: 0.875rem;
      color: var(--gray-900);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .user-role { display: block; font-size: 0.75rem; color: var(--gray-500); }

    .sidebar-nav { flex: 1; padding: 0.75rem; overflow-y: auto; }

    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.625rem 0.875rem;
      color: var(--gray-600); text-decoration: none;
      border-radius: 8px;
      margin-bottom: 0.125rem;
      font-weight: 500; font-size: 0.9rem;
      transition: background 0.15s, color 0.15s;
    }
    .nav-item svg { flex-shrink: 0; }
    .nav-item:hover { background: var(--gray-50); color: var(--gray-900); }
    .nav-item.active {
      background: var(--nav-active-bg);
      color: var(--nav-active-color);
      font-weight: 600;
    }

    .nav-divider { height: 1px; background: var(--gray-200); margin: 0.75rem 0.25rem; }

    .sidebar-footer { padding: 0.75rem; border-top: 1px solid var(--gray-100); }
    .logout-btn {
      width: 100%;
      display: flex; align-items: center; justify-content: flex-start; gap: 0.5rem;
      padding: 0.6rem 0.875rem;
      background: transparent;
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      color: var(--gray-600);
      font-family: inherit; font-size: 0.875rem; font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .logout-btn:hover { background: #FEE2E2; border-color: #FECACA; color: var(--danger); }

    .collapse-btn {
      position: absolute; top: 50%; right: -12px; transform: translateY(-50%);
      width: 24px; height: 24px;
      background: #fff;
      border: 1px solid var(--gray-200);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--gray-500);
      box-shadow: var(--shadow-sm);
    }
    .collapse-btn:hover { color: var(--gray-700); }

    .main-content {
      flex: 1; margin-left: 240px;
      transition: margin-left 0.3s;
      display: flex; flex-direction: column; min-height: 100vh;
    }
    .sidebar.collapsed + .mobile-overlay + .main-content,
    .sidebar.collapsed ~ .main-content { margin-left: 72px; }

    .top-header {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.875rem 1.5rem;
      background: #fff; border-bottom: 1px solid var(--gray-100);
      position: sticky; top: 0; z-index: 50;
    }
    .header-title { flex: 1; font-weight: 600; color: var(--gray-800); font-size: 1rem; }

    .mobile-menu-btn { display: none; background: none; border: none; padding: 0.4rem; color: var(--gray-700); cursor: pointer; }

    .notification-btn {
      width: 38px; height: 38px;
      display: flex; align-items: center; justify-content: center;
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      color: var(--gray-600); cursor: pointer;
      transition: all 0.2s;
    }
    .notification-btn:hover { background: var(--gray-100); color: var(--gray-900); }

    .page-content { flex: 1; padding: 0; }

    .mobile-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 90;
    }

    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); width: 240px !important; }
      .sidebar.collapsed { width: 240px !important; }
      .layout.sidebar-open .sidebar { transform: translateX(0); }
      .layout.sidebar-open .mobile-overlay { display: block; }
      .main-content { margin-left: 0 !important; }
      .collapse-btn { display: none; }
      .mobile-menu-btn { display: flex; }
    }
  `]
})
export class RoleLayoutComponent implements OnInit {
  @Input() roleLabel = '';
  @Input() pageTitle = '';
  @Input() navItems: RoleNavItem[] = [];
  @Input() extraSearch?: { route: string; label: string };

  collapsed = false;
  mobileOpen = false;
  displayName = '';
  initials = '';

  // Icônes utilisées hors navItems
  readonly searchIcon: LucideIconData = LucideSearch.icon;
  readonly logoutIcon: LucideIconData = LucideLogOut.icon;
  readonly chevronIcon: LucideIconData = LucideChevronLeft.icon;
  readonly menuIcon: LucideIconData = LucideMenu.icon;
  readonly bellIcon: LucideIconData = LucideBell.icon;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.displayName = `${user.prenom} ${user.nom}`;
      const a = user.prenom?.[0] ?? '';
      const b = user.nom?.[0] ?? '';
      this.initials = (a + b).toUpperCase();
    }
  }

  iconFor(key: IconKey): LucideIconData {
    return ICON_MAP[key];
  }

  toggleCollapse(): void { this.collapsed = !this.collapsed; }
  toggleMobile(): void { this.mobileOpen = !this.mobileOpen; }
  closeMobile(): void { this.mobileOpen = false; }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
