import { Component } from '@angular/core';
import { RoleLayoutComponent, RoleNavItem } from '../../../shared/components/role-layout/role-layout.component';

@Component({
  selector: 'app-medecin-layout',
  standalone: true,
  imports: [RoleLayoutComponent],
  template: `
    <app-role-layout
      roleLabel="Médecin"
      pageTitle="Espace médecin"
      [navItems]="navItems">
    </app-role-layout>
  `
})
export class MedecinLayoutComponent {
  navItems: RoleNavItem[] = [
    { route: '/medecin',                label: 'Tableau de bord', icon: 'home',     exact: true },
    { route: '/medecin/planning',       label: 'Planning',        icon: 'calendar' },
    { route: '/medecin/consultations',  label: 'Consultations',   icon: 'fileEdit' },
    { route: '/medecin/profile',        label: 'Mon profil',      icon: 'user' },
  ];
}
