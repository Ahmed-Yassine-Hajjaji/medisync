import { Routes } from '@angular/router';

export const SECRETAIRE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/secretaire-dashboard.component').then(m => m.SecretaireDashboardComponent)
  }
];
