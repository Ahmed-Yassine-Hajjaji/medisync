import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent)
  },
  {
    path: 'appointments',
    loadComponent: () => import('./appointments/patient-appointments.component').then(m => m.PatientAppointmentsComponent)
  },
  {
    path: 'consultations',
    loadComponent: () => import('./consultations/patient-consultations.component').then(m => m.PatientConsultationsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/patient-profile.component').then(m => m.PatientProfileComponent)
  }
];
