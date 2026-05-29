import { Component } from '@angular/core';
import { RoleLayoutComponent, RoleNavItem } from '../../../shared/components/role-layout/role-layout.component';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [RoleLayoutComponent],
  template: `
    <app-role-layout
      roleLabel="Patient"
      pageTitle="Mon espace"
      [navItems]="navItems"
      [extraSearch]="{ route: '/medecins', label: 'Trouver un médecin' }">
    </app-role-layout>
  `
})
export class PatientLayoutComponent {
  navItems: RoleNavItem[] = [
    { route: '/patient',                 label: 'Accueil',       icon: 'home',         exact: true },
    { route: '/patient/appointments',    label: 'Mes RDV',       icon: 'calendar' },
    { route: '/patient/medical-record',  label: 'Mon dossier',   icon: 'fileText' },
    { route: '/patient/prescriptions',   label: 'Ordonnances',   icon: 'prescription' },
    { route: '/patient/profile',         label: 'Mon profil',    icon: 'user' },
  ];
}
