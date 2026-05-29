import { Component } from '@angular/core';
import { RoleLayoutComponent, RoleNavItem } from '../../../shared/components/role-layout/role-layout.component';

@Component({
  selector: 'app-secretaire-layout',
  standalone: true,
  imports: [RoleLayoutComponent],
  template: `
    <app-role-layout
      roleLabel="Secrétaire"
      pageTitle="Espace secrétaire"
      [navItems]="navItems">
    </app-role-layout>
  `
})
export class SecretaireLayoutComponent {
  navItems: RoleNavItem[] = [
    { route: '/secretaire',              label: 'Tableau de bord', icon: 'home',     exact: true },
    { route: '/secretaire/agenda',       label: 'RDV du jour',     icon: 'clock' },
    { route: '/secretaire/appointments', label: 'Gestion RDV',     icon: 'calendar' },
    { route: '/secretaire/patients',     label: 'Patients',        icon: 'users' },
    { route: '/secretaire/billing',      label: 'Facturation',     icon: 'invoice' },
  ];
}
