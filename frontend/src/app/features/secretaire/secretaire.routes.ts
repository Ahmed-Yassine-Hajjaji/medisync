import { Routes } from '@angular/router';

export const SECRETAIRE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/secretaire-layout.component').then(m => m.SecretaireLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/secretaire-dashboard.component').then(m => m.SecretaireDashboardComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./agenda/secretaire-agenda.component').then(m => m.SecretaireAgendaComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./appointments/secretaire-appointments.component').then(m => m.SecretaireAppointmentsComponent)
      },
      {
        path: 'patients',
        loadComponent: () => import('./patients/secretaire-patients.component').then(m => m.SecretairePatientsComponent)
      },
      {
        path: 'billing',
        loadComponent: () => import('./billing/secretaire-billing.component').then(m => m.SecretaireBillingComponent)
      }
    ]
  }
];
