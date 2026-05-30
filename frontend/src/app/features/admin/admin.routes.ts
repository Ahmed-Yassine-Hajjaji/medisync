import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'staff',
        loadComponent: () => import('./staff-management/staff-management.component').then(m => m.StaffManagementComponent)
      },
      {
        path: 'financial',
        loadComponent: () => import('./financial-reports/financial-reports.component').then(m => m.FinancialReportsComponent)
      },
      {
        path: 'rooms',
        loadComponent: () => import('./rooms-config/rooms-config.component').then(m => m.RoomsConfigComponent)
      },
      {
        path: 'security',
        loadComponent: () => import('./two-factor-setup/two-factor-setup.component').then(m => m.TwoFactorSetupComponent)
      },
      {
        path: 'audit',
        loadComponent: () => import('./audit/audit-log.component').then(m => m.AuditLogComponent)
      }
    ]
  }
];
