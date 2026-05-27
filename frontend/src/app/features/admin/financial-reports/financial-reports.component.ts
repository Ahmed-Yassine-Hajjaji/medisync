import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
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

interface PaymentMethod {
  name: string;
  value: number;
}

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule],
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
          <button class="btn-export" (click)="exportReport()">&#128229; Exporter PDF</button>
        </div>
      </header>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card revenue">
          <div class="kpi-icon">&#128176;</div>
          <div class="kpi-content">
            <span class="kpi-label">Chiffre d'affaires</span>
            <span class="kpi-value">{{ stats.totalRevenue | number:'1.2-2' }} EUR</span>
          </div>
        </div>
        <div class="kpi-card paid">
          <div class="kpi-icon">&#9989;</div>
          <div class="kpi-content">
            <span class="kpi-label">Paye</span>
            <span class="kpi-value">{{ stats.totalPaid | number:'1.2-2' }} EUR</span>
          </div>
        </div>
        <div class="kpi-card pending">
          <div class="kpi-icon">&#9203;</div>
          <div class="kpi-content">
            <span class="kpi-label">En attente</span>
            <span class="kpi-value">{{ stats.totalPending | number:'1.2-2' }} EUR</span>
          </div>
        </div>
        <div class="kpi-card overdue">
          <div class="kpi-icon">&#9888;</div>
          <div class="kpi-content">
            <span class="kpi-label">Impaye</span>
            <span class="kpi-value">{{ stats.totalOverdue | number:'1.2-2' }} EUR</span>
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
          <span class="stat-value">{{ averageTicket | number:'1.0-0' }} EUR</span>
          <span class="stat-label">Panier moyen</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ paymentRate | number:'1.0-0' }}%</span>
          <span class="stat-label">Taux encaissement</span>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <!-- Revenue by Month -->
        <div class="chart-card">
          <h3>Evolution du chiffre d'affaires</h3>
          <ngx-charts-bar-chart
            [results]="revenueByMonth"
            [xAxis]="true"
            [yAxis]="true"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true"
            xAxisLabel="Mois"
            yAxisLabel="Montant (EUR)"
            [scheme]="colorScheme"
            [gradient]="true">
          </ngx-charts-bar-chart>
        </div>

        <!-- Revenue by Doctor -->
        <div class="chart-card">
          <h3>Chiffre d'affaires par medecin</h3>
          <ngx-charts-pie-chart
            [results]="revenueByDoctor"
            [scheme]="colorScheme"
            [labels]="true"
            [doughnut]="true">
          </ngx-charts-pie-chart>
        </div>

        <!-- Payment Methods -->
        <div class="chart-card">
          <h3>Modes de paiement</h3>
          <ngx-charts-advanced-pie-chart
            [results]="paymentMethods"
            [scheme]="colorScheme">
          </ngx-charts-advanced-pie-chart>
        </div>

        <!-- Consultations Trend -->
        <div class="chart-card">
          <h3>Evolution des consultations</h3>
          <ngx-charts-line-chart
            [results]="consultationsTrend"
            [xAxis]="true"
            [yAxis]="true"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true"
            xAxisLabel="Mois"
            yAxisLabel="Nombre"
            [scheme]="colorScheme"
            [autoScale]="true">
          </ngx-charts-line-chart>
        </div>
      </div>

      <!-- Recent Invoices -->
      <div class="invoices-section">
        <h3>Dernieres factures</h3>
        <table class="invoices-table">
          <thead>
            <tr>
              <th>N° Facture</th>
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
                <td>{{ invoice.montantTotal | number:'1.2-2' }} EUR</td>
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
    .chart-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 350px; }
    .chart-card h3 { margin: 0 0 20px 0; font-size: 16px; }
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
  paymentMethods: PaymentMethod[] = [];
  consultationsTrend: any[] = [];
  recentInvoices: any[] = [];

  startDate: string;
  endDate: string;

  colorScheme = {
    domain: ['#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4']
  };

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
    this.loadPaymentMethods();
    this.loadConsultationsTrend();
    this.loadRecentInvoices();
  }

  loadStats(): void {
    this.http.get<FinancialStats>(
      `${environment.apiUrl}/admin/financial/stats?start=${this.startDate}&end=${this.endDate}`
    ).subscribe(data => this.stats = data);
  }

  loadRevenueByMonth(): void {
    this.http.get<RevenueByMonth[]>(
      `${environment.apiUrl}/admin/financial/revenue-by-month?start=${this.startDate}&end=${this.endDate}`
    ).subscribe(data => this.revenueByMonth = data);
  }

  loadRevenueByDoctor(): void {
    this.http.get<RevenueByDoctor[]>(
      `${environment.apiUrl}/admin/financial/revenue-by-doctor?start=${this.startDate}&end=${this.endDate}`
    ).subscribe(data => this.revenueByDoctor = data);
  }

  loadPaymentMethods(): void {
    this.http.get<PaymentMethod[]>(
      `${environment.apiUrl}/admin/financial/payment-methods?start=${this.startDate}&end=${this.endDate}`
    ).subscribe(data => this.paymentMethods = data);
  }

  loadConsultationsTrend(): void {
    this.http.get<any[]>(
      `${environment.apiUrl}/admin/financial/consultations-trend?start=${this.startDate}&end=${this.endDate}`
    ).subscribe(data => {
      this.consultationsTrend = [{
        name: 'Consultations',
        series: data
      }];
    });
  }

  loadRecentInvoices(): void {
    this.http.get<any[]>(`${environment.apiUrl}/admin/invoices?limit=10`)
      .subscribe(data => this.recentInvoices = data);
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
