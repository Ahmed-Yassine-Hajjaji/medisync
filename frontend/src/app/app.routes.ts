import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'medecins',
    loadComponent: () => import('./features/public/medecins-list/medecins-list.component').then(m => m.MedecinsListComponent)
  },
  {
    path: 'medecins/:id',
    loadComponent: () => import('./features/public/medecin-detail/medecin-detail.component').then(m => m.MedecinDetailComponent)
  },
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
    loadChildren: () => import('./features/patient/patient.routes').then(m => m.PATIENT_ROUTES)
  },
  {
    path: 'medecin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MEDECIN'] },
    loadChildren: () => import('./features/medecin/medecin.routes').then(m => m.MEDECIN_ROUTES)
  },
  {
    path: 'secretaire',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SECRETAIRE'] },
    loadChildren: () => import('./features/secretaire/secretaire.routes').then(m => m.SECRETAIRE_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
