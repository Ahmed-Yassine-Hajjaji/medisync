import { Routes } from '@angular/router';

export const MEDECIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/medecin-layout.component').then(m => m.MedecinLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/medecin-dashboard.component').then(m => m.MedecinDashboardComponent)
      },
      {
        path: 'planning',
        loadComponent: () => import('./planning/medecin-planning.component').then(m => m.MedecinPlanningComponent)
      },
      {
        path: 'consultations',
        loadComponent: () => import('./consultations/medecin-consultations.component').then(m => m.MedecinConsultationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/medecin-profile.component').then(m => m.MedecinProfileComponent)
      }
    ]
  }
];
