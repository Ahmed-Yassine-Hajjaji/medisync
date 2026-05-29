import { Component } from '@angular/core';
import { RoleLayoutComponent, RoleNavItem } from '../../../shared/components/role-layout/role-layout.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RoleLayoutComponent],
  template: `
    <app-role-layout
      roleLabel="Administrateur"
      pageTitle="Administration"
      [navItems]="navItems">
    </app-role-layout>
  `
})
export class AdminLayoutComponent {
  navItems: RoleNavItem[] = [
    { route: '/admin',           label: 'Tableau de bord', icon: 'home',     exact: true },
    { route: '/admin/staff',     label: 'Personnel',       icon: 'users' },
    { route: '/admin/financial', label: 'Finances',        icon: 'chart' },
    { route: '/admin/rooms',     label: 'Salles',          icon: 'door' },
    { route: '/admin/security',  label: 'Sécurité 2FA',    icon: 'shield' },
  ];
}
