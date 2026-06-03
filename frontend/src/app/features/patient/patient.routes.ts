import { Routes } from '@angular/router';
import { PatientLayoutComponent } from './layout/patient-layout.component';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    component: PatientLayoutComponent,
    children: [
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
        path: 'medical-record',
        loadComponent: () => import('./medical-record/medical-record.component').then(m => m.MedicalRecordComponent)
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./prescriptions/prescriptions.component').then(m => m.PrescriptionsComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./invoices/patient-invoices.component').then(m => m.PatientInvoicesComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/patient-profile.component').then(m => m.PatientProfileComponent)
      }
    ]
  }
];
