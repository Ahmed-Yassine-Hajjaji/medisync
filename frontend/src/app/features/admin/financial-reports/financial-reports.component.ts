import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface FinancialStats {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  appointmentsCount: number;
  consultationsCount: number;
}

interface RevenueByMonth {
  name: string;
  value: number;
}

interface RevenueByDoctor {
  name: string;
  value: number;
}

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="financial-reports">
      <header class="page-header">
        <div>
          <h1>Rapports financiers</h1>
          <p>Analysez les performances financieres de la clinique</p>
        </div>
        <div class="date-range">
          <input type="date" [(ngModel)]="startDate" (change)="loadData()">
          <span>a</span>
          <input type="date" [(ngModel)]="endDate" (change)="loadData()">
          <button class="btn-export" (click)="exportReport()">Exporter PDF</button>
        </div>
      </header>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card revenue">
          <div class="kpi-icon">&#128176;</div>
          <div class="kpi-content">
            <span class="kpi-label">Chiffre d'affaires</span>
            <span class="kpi-value">{{ stats.totalRevenue | number:'1.2-2' }} DH</span>
          </div>
        </div>
        <div class="kpi-card paid">
          <div class="kpi-icon">&#9989;</div>
          <div class="kpi-content">
            <span class="kpi-label">Paye</span>
            <span class="kpi-value">{{ stats.totalPaid | number:'1.2-2' }} DH</span>
          </div>
        </div>
        <div class="kpi-card pending">
          <div class="kpi-icon">&#9203;</div>
          <div class="kpi-content">
            <span class="kpi-label">En attente</span>
            <span class="kpi-value">{{ stats.totalPending | number:'1.2-2' }} DH</span>
          </div>
        </div>
        <div class="kpi-card overdue">
          <div class="kpi-icon">&#9888;</div>
          <div class="kpi-content">
            <span class="kpi-label">Impaye</span>
            <span class="kpi-value">{{ stats.totalOverdue | number:'1.2-2' }} DH</span>
          </div>
        </div>
      </div>

      <!-- Activity Stats -->
      <div class="activity-stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.appointmentsCount }}</span>
          <span class="stat-label">Rendez-vous</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.consultationsCount }}</span>
          <span class="stat-label">Consultations</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ averageTicket | number:'1.0-0' }} DH</span>
          <span class="stat-label">Panier moyen</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ paymentRate | number:'1.0-0' }}%</span>
          <span class="stat-label">Taux encaissement</span>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Revenue by Month -->
        <div class="chart-card">
          <h3>Evolution du chiffre d'affaires</h3>
          <div class="bar-chart">
            @for (item of revenueByMonth; track item.name) {
              <div class="bar-item">
                <span class="bar-label">{{ item.name }}</span>
                <div class="bar-container">
                  <div class="bar" [style.width.%]="getBarWidth(item.value)"></div>
                </div>
                <span class="bar-value">{{ item.value | number:'1.0-0' }} DH</span>
              </div>
            }
          </div>
        </div>

        <!-- Revenue by Doctor -->
        <div class="chart-card">
          <h3>Chiffre d'affaires par medecin</h3>
          <div class="doctor-list">
            @for (doc of revenueByDoctor; track doc.name; let i = $index) {
              <div class="doctor-item">
                <div class="doctor-rank">{{ i + 1 }}</div>
                <div class="doctor-info">
                  <span class="doctor-name">{{ doc.name }}</span>
                  <div class="progress-bar">
                    <div class="progress" [style.width.%]="getDoctorPercent(doc.value)"></div>
                  </div>
                </div>
                <span class="doctor-value">{{ doc.value | number:'1.0-0' }} DH</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Invoices -->
      <div class="invoices-section">
        <h3>Dernieres factures</h3>
        <table class="invoices-table">
          <thead>
            <tr>
              <th>N Facture</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (invoice of recentInvoices; track invoice.id) {
              <tr>
                <td>{{ invoice.numeroFacture }}</td>
                <td>{{ invoice.patientNom }}</td>
                <td>{{ invoice.dateFacture | date:'dd/MM/yyyy' }}</td>
                <td>{{ invoice.montantTotal | number:'1.2-2' }} DH</td>
                <td>
                  <span class="status-badge" [class]="invoice.statut.toLowerCase()">
                    {{ getStatusLabel(invoice.statut) }}
                  </span>
                </td>
                <td>
                  <button class="btn-icon" (click)="viewInvoice(invoice)">&#128065;</button>
                  <button class="btn-icon" (click)="downloadInvoice(invoice)">&#128229;</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .financial-reports { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
    .page-header h1 { margin: 0 0 8px 0; }
    .page-header p { margin: 0; color: #666; }
    .date-range { display: flex; align-items: center; gap: 12px; }
    .date-range input { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; }
    .date-range span { color: #666; }
    .btn-export { padding: 10px 20px; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .kpi-card { display: flex; align-items: center; gap: 16px; padding: 24px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; }
    .kpi-content { display: flex; flex-direction: column; }
    .kpi-label { font-size: 13px; color: #666; margin-bottom: 4px; }
    .kpi-value { font-size: 24px; font-weight: bold; }
    .kpi-card.revenue { border-left: 4px solid #1976d2; }
    .kpi-card.paid { border-left: 4px solid #4caf50; }
    .kpi-card.pending { border-left: 4px solid #ff9800; }
    .kpi-card.overdue { border-left: 4px solid #f44336; }
    .activity-stats { display: flex; gap: 40px; padding: 20px; background: #f5f5f5; border-radius: 12px; margin-bottom: 32px; flex-wrap: wrap; }
    .stat-item { text-align: center; }
    .stat-value { display: block; font-size: 28px; font-weight: bold; color: #1976d2; }
    .stat-label { font-size: 13px; color: #666; }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .chart-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .chart-card h3 { margin: 0 0 20px 0; font-size: 16px; }
    .bar-chart { display: flex; flex-direction: column; gap: 12px; }
    .bar-item { display: flex; align-items: center; gap: 12px; }
    .bar-label { width: 60px; font-size: 12px; color: #666; }
    .bar-container { flex: 1; height: 24px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
    .bar { height: 100%; background: linear-gradient(90deg, #1976d2, #42a5f5); border-radius: 4px; transition: width 0.3s; }
    .bar-value { width: 80px; text-align: right; font-size: 12px; font-weight: 500; }
    .doctor-list { display: flex; flex-direction: column; gap: 16px; }
    .doctor-item { display: flex; align-items: center; gap: 12px; }
    .doctor-rank { width: 28px; height: 28px; background: #1976d2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
    .doctor-info { flex: 1; }
    .doctor-name { display: block; font-size: 14px; margin-bottom: 4px; }
    .progress-bar { height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
    .progress { height: 100%; background: #4caf50; border-radius: 4px; }
    .doctor-value { font-size: 14px; font-weight: 500; }
    .invoices-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .invoices-section h3 { margin: 0 0 20px 0; }
    .invoices-table { width: 100%; border-collapse: collapse; }
    .invoices-table th, .invoices-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .invoices-table th { font-weight: 600; color: #666; font-size: 13px; text-transform: uppercase; }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-badge.paye { background: #e8f5e9; color: #2e7d32; }
    .status-badge.en_attente { background: #fff3e0; color: #e65100; }
    .status-badge.impaye { background: #ffebee; color: #c62828; }
    .status-badge.partiel { background: #e3f2fd; color: #1565c0; }
    .btn-icon { width: 32px; height: 32px; border: none; background: #f5f5f5; border-radius: 6px; cursor: pointer; margin-right: 4px; }
    .btn-icon:hover { background: #e0e0e0; }
  `]
})
export class FinancialReportsComponent implements OnInit {
  stats: FinancialStats = {
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    appointmentsCount: 0,
    consultationsCount: 0
  };

  revenueByMonth: RevenueByMonth[] = [];
  revenueByDoctor: RevenueByDoctor[] = [];
  recentInvoices: any[] = [];

  startDate: string;
  endDate: string;
  maxRevenue = 0;
  maxDoctorRevenue = 0;

  get averageTicket(): number {
    return this.stats.consultationsCount > 0
      ? this.stats.totalRevenue / this.stats.consultationsCount
      : 0;
  }

  get paymentRate(): number {
    return this.stats.totalRevenue > 0
      ? (this.stats.totalPaid / this.stats.totalRevenue) * 100
      : 0;
  }

  constructor(private http: HttpClient) {
    const now = new Date();
    this.endDate = now.toISOString().split('T')[0];
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
    this.startDate = threeMonthsAgo.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadStats();
    this.loadRevenueByMonth();
    this.loadRevenueByDoctor();
    this.loadRecentInvoices();
  }

  loadStats(): void {
    this.http.get<FinancialStats>(
      `${environment.apiUrl}/admin/financial/stats?start=${this.startDate}&end=${this.endDate}`
    ).subscribe({
      next: data => this.stats = data,
      error: () => {
        // Demo data
        this.stats = {
          totalRevenue: 45680,
          totalPaid: 38500,
          totalPending: 5180,
          totalOverdue: 2000,
          appointmentsCount: 342,
          consultationsCount: 298
        };
      }
    });
  }

  loadRevenueByMonth(): void {
    this.http.get<RevenueByMonth[]>(
      `${environment.apiUrl}/admin/financial/revenue-by-month?start=${this.startDate}&end=${this.endDate}`
    ).subscribe({
      next: data => {
        this.revenueByMonth = data;
        this.maxRevenue = Math.max(...data.map(d => d.value));
      },
      error: () => {
        // Demo data
        this.revenueByMonth = [
          { name: 'Jan', value: 12500 },
          { name: 'Fev', value: 14200 },
          { name: 'Mar', value: 18980 }
        ];
        this.maxRevenue = 18980;
      }
    });
  }

  loadRevenueByDoctor(): void {
    this.http.get<RevenueByDoctor[]>(
      `${environment.apiUrl}/admin/financial/revenue-by-doctor?start=${this.startDate}&end=${this.endDate}`
    ).subscribe({
      next: data => {
        this.revenueByDoctor = data;
        this.maxDoctorRevenue = Math.max(...data.map(d => d.value));
      },
      error: () => {
        // Demo data
        this.revenueByDoctor = [
          { name: 'Dr. Martin', value: 15200 },
          { name: 'Dr. Dupont', value: 12800 },
          { name: 'Dr. Bernard', value: 9680 },
          { name: 'Dr. Petit', value: 8000 }
        ];
        this.maxDoctorRevenue = 15200;
      }
    });
  }

  loadRecentInvoices(): void {
    this.http.get<any[]>(`${environment.apiUrl}/admin/invoices?limit=10`)
      .subscribe({
        next: data => this.recentInvoices = data,
        error: () => {
          // Demo data
          this.recentInvoices = [
            { id: 1, numeroFacture: 'F-2026-0042', patientNom: 'Dupont Marie', dateFacture: '2026-05-25', montantTotal: 85, statut: 'PAYE' },
            { id: 2, numeroFacture: 'F-2026-0041', patientNom: 'Martin Jean', dateFacture: '2026-05-24', montantTotal: 120, statut: 'EN_ATTENTE' },
            { id: 3, numeroFacture: 'F-2026-0040', patientNom: 'Bernard Sophie', dateFacture: '2026-05-23', montantTotal: 65, statut: 'PAYE' }
          ];
        }
      });
  }

  getBarWidth(value: number): number {
    return this.maxRevenue > 0 ? (value / this.maxRevenue) * 100 : 0;
  }

  getDoctorPercent(value: number): number {
    return this.maxDoctorRevenue > 0 ? (value / this.maxDoctorRevenue) * 100 : 0;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PAYE': 'Paye',
      'EN_ATTENTE': 'En attente',
      'IMPAYE': 'Impaye',
      'PARTIEL': 'Partiel',
      'REMBOURSE': 'Rembourse'
    };
    return labels[status] || status;
  }

  viewInvoice(invoice: any): void {
    window.open(`${environment.apiUrl}/admin/invoices/${invoice.id}/view`, '_blank');
  }

  downloadInvoice(invoice: any): void {
    window.open(`${environment.apiUrl}/admin/invoices/${invoice.id}/download`, '_blank');
  }

  exportReport(): void {
    window.open(
      `${environment.apiUrl}/admin/financial/export?start=${this.startDate}&end=${this.endDate}&format=pdf`,
      '_blank'
    );
  }
}
