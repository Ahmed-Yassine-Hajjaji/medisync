import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from '../../../../environments/environment';

interface FinancialStats {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  appointmentsCount: number;
  consultationsCount: number;
}

interface NameValue { name: string; value: number; }

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="financial-reports">
      <header class="page-header">
        <div>
          <h1>Rapports financiers</h1>
          <p>Performances financières de la clinique</p>
        </div>
        <div class="header-actions">
          <input type="date" [(ngModel)]="startDate" (change)="loadData()">
          <span class="sep">→</span>
          <input type="date" [(ngModel)]="endDate" (change)="loadData()">
          <button class="btn-action btn-pdf" (click)="exportPDF()" [disabled]="loading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            PDF
          </button>
          <button class="btn-action btn-excel" (click)="exportExcel()" [disabled]="loading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="3"/></svg>
            Excel
          </button>
        </div>
      </header>

      @if (loading) {
        <div class="loading-state">Chargement des données...</div>
      }

      @if (error) {
        <div class="error-banner">{{ error }}</div>
      }

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Chiffre d'affaires</span>
            <span class="kpi-value">{{ stats.totalRevenue | number:'1.0-0' }} DH</span>
          </div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Encaissé</span>
            <span class="kpi-value">{{ stats.totalPaid | number:'1.0-0' }} DH</span>
          </div>
        </div>
        <div class="kpi-card kpi-orange">
          <div class="kpi-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">En attente</span>
            <span class="kpi-value">{{ stats.totalPending | number:'1.0-0' }} DH</span>
          </div>
        </div>
        <div class="kpi-card kpi-red">
          <div class="kpi-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Impayé</span>
            <span class="kpi-value">{{ stats.totalOverdue | number:'1.0-0' }} DH</span>
          </div>
        </div>
      </div>

      <!-- Secondary stats -->
      <div class="secondary-stats">
        <div class="stat-pill">
          <span class="stat-num">{{ stats.appointmentsCount }}</span>
          <span class="stat-lbl">Rendez-vous</span>
        </div>
        <div class="divider-v"></div>
        <div class="stat-pill">
          <span class="stat-num">{{ stats.consultationsCount }}</span>
          <span class="stat-lbl">Consultations</span>
        </div>
        <div class="divider-v"></div>
        <div class="stat-pill">
          <span class="stat-num">{{ averageTicket | number:'1.0-0' }} DH</span>
          <span class="stat-lbl">Panier moyen</span>
        </div>
        <div class="divider-v"></div>
        <div class="stat-pill">
          <span class="stat-num">{{ paymentRate | number:'1.0-0' }}%</span>
          <span class="stat-lbl">Taux d'encaissement</span>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-row">
        <div class="chart-card">
          <h3>Évolution mensuelle du CA</h3>
          @if (revenueByMonth.length === 0) {
            <p class="empty-chart">Aucune donnée pour la période sélectionnée</p>
          }
          @for (item of revenueByMonth; track item.name) {
            <div class="bar-row">
              <span class="bar-label">{{ item.name }}</span>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="pct(item.value, maxMonth)"></div>
              </div>
              <span class="bar-val">{{ item.value | number:'1.0-0' }} DH</span>
            </div>
          }
        </div>

        <div class="chart-card">
          <h3>CA par médecin</h3>
          @if (revenueByDoctor.length === 0) {
            <p class="empty-chart">Aucune donnée pour la période sélectionnée</p>
          }
          @for (doc of revenueByDoctor; track doc.name; let i = $index) {
            <div class="doc-row">
              <span class="doc-rank">{{ i + 1 }}</span>
              <div class="doc-info">
                <span class="doc-name">{{ doc.name }}</span>
                <div class="progress-track">
                  <div class="progress-fill" [style.width.%]="pct(doc.value, maxDoctor)"></div>
                </div>
              </div>
              <span class="doc-val">{{ doc.value | number:'1.0-0' }} DH</span>
            </div>
          }
        </div>
      </div>

      <!-- Invoices table -->
      <div class="table-card">
        <h3>Dernières factures</h3>
        <table class="inv-table">
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Payé</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            @for (inv of recentInvoices; track inv.id) {
              <tr>
                <td class="mono">{{ inv.numeroFacture }}</td>
                <td>{{ inv.patientNom }}</td>
                <td>{{ inv.dateFacture | date:'dd/MM/yyyy' }}</td>
                <td><strong>{{ inv.montantTotal | number:'1.0-0' }} DH</strong></td>
                <td>{{ inv.montantPaye | number:'1.0-0' }} DH</td>
                <td>
                  <span class="badge" [class]="badgeClass(inv.statut)">
                    {{ statusLabel(inv.statut) }}
                  </span>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="empty-row">Aucune facture pour cette période</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .financial-reports { padding: 28px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
    .page-header h1 { margin: 0 0 4px; font-size: 1.5rem; font-weight: 700; }
    .page-header p { margin: 0; color: #64748b; font-size: 0.9rem; }

    .header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .header-actions input { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 0.875rem; }
    .sep { color: #94a3b8; }

    .btn-action { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.875rem; font-family: inherit; transition: opacity 0.2s; }
    .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-pdf { background: #dc2626; color: white; }
    .btn-excel { background: #16a34a; color: white; }

    .loading-state { text-align: center; padding: 16px; color: #64748b; }
    .error-banner { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
    @media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 500px) { .kpi-grid { grid-template-columns: 1fr; } }

    .kpi-card { display: flex; align-items: center; gap: 14px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 1px 8px rgba(0,0,0,0.07); border-left: 4px solid transparent; }
    .kpi-blue { border-left-color: #1E6FD9; }
    .kpi-green { border-left-color: #16a34a; }
    .kpi-orange { border-left-color: #ea580c; }
    .kpi-red { border-left-color: #dc2626; }

    .kpi-icon-wrap { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .kpi-blue .kpi-icon-wrap { background: #EAF2FD; color: #1E6FD9; }
    .kpi-green .kpi-icon-wrap { background: #dcfce7; color: #16a34a; }
    .kpi-orange .kpi-icon-wrap { background: #fff7ed; color: #ea580c; }
    .kpi-red .kpi-icon-wrap { background: #fef2f2; color: #dc2626; }

    .kpi-body { display: flex; flex-direction: column; }
    .kpi-label { font-size: 0.8rem; color: #64748b; margin-bottom: 2px; }
    .kpi-value { font-size: 1.375rem; font-weight: 700; color: #0f172a; }

    .secondary-stats { display: flex; align-items: center; background: white; border-radius: 12px; padding: 20px 28px; margin-bottom: 24px; box-shadow: 0 1px 8px rgba(0,0,0,0.07); gap: 0; flex-wrap: wrap; }
    .stat-pill { text-align: center; padding: 0 28px; }
    .stat-num { display: block; font-size: 1.5rem; font-weight: 800; color: #1E6FD9; }
    .stat-lbl { font-size: 0.8rem; color: #64748b; }
    .divider-v { width: 1px; background: #e2e8f0; height: 40px; }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 768px) { .charts-row { grid-template-columns: 1fr; } }

    .chart-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 8px rgba(0,0,0,0.07); }
    .chart-card h3 { margin: 0 0 20px; font-size: 1rem; font-weight: 700; color: #0f172a; }
    .empty-chart { color: #94a3b8; font-size: 0.875rem; text-align: center; padding: 20px 0; }

    .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .bar-label { width: 70px; font-size: 0.8rem; color: #64748b; flex-shrink: 0; }
    .bar-track { flex: 1; height: 22px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, #1E6FD9, #60a5fa); border-radius: 6px; transition: width 0.5s ease; }
    .bar-val { width: 80px; text-align: right; font-size: 0.8rem; font-weight: 600; color: #0f172a; }

    .doc-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .doc-rank { width: 26px; height: 26px; background: #1E6FD9; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .doc-info { flex: 1; min-width: 0; }
    .doc-name { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .progress-track { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #16a34a; border-radius: 4px; transition: width 0.5s ease; }
    .doc-val { font-size: 0.875rem; font-weight: 600; color: #0f172a; white-space: nowrap; }

    .table-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 8px rgba(0,0,0,0.07); }
    .table-card h3 { margin: 0 0 16px; font-size: 1rem; font-weight: 700; }
    .inv-table { width: 100%; border-collapse: collapse; }
    .inv-table th { padding: 10px 14px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; border-bottom: 2px solid #f1f5f9; background: #fafafa; }
    .inv-table td { padding: 12px 14px; font-size: 0.875rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .inv-table tr:last-child td { border-bottom: none; }
    .inv-table tr:hover td { background: #f8fafc; }
    .mono { font-family: monospace; font-size: 0.825rem; }
    .empty-row { text-align: center; color: #94a3b8; padding: 32px; }

    .badge { padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .badge-paye { background: #dcfce7; color: #15803d; }
    .badge-partiel { background: #dbeafe; color: #1d4ed8; }
    .badge-en_attente { background: #fff7ed; color: #c2410c; }
    .badge-impaye { background: #fef2f2; color: #b91c1c; }
    .badge-rembourse { background: #f3f4f6; color: #4b5563; }
  `]
})
export class FinancialReportsComponent implements OnInit {
  stats: FinancialStats = { totalRevenue: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0, appointmentsCount: 0, consultationsCount: 0 };
  revenueByMonth: NameValue[] = [];
  revenueByDoctor: NameValue[] = [];
  recentInvoices: any[] = [];

  startDate: string;
  endDate: string;
  loading = false;
  error = '';

  get maxMonth(): number { return Math.max(...this.revenueByMonth.map(d => d.value), 1); }
  get maxDoctor(): number { return Math.max(...this.revenueByDoctor.map(d => d.value), 1); }
  get averageTicket(): number { return this.stats.consultationsCount > 0 ? this.stats.totalRevenue / this.stats.consultationsCount : 0; }
  get paymentRate(): number { return this.stats.totalRevenue > 0 ? (this.stats.totalPaid / this.stats.totalRevenue) * 100 : 0; }

  constructor(private http: HttpClient) {
    const now = new Date();
    this.endDate = now.toISOString().split('T')[0];
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);
    this.startDate = start.toISOString().split('T')[0];
  }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    this.error = '';
    const base = `${environment.apiUrl}/admin`;
    const range = `start=${this.startDate}&end=${this.endDate}`;

    let done = 0;
    const check = () => { if (++done === 4) this.loading = false; };

    this.http.get<FinancialStats>(`${base}/financial/stats?${range}`).subscribe({
      next: d => { this.stats = d; check(); },
      error: () => { this.error = 'Impossible de charger les statistiques financières.'; check(); }
    });

    this.http.get<NameValue[]>(`${base}/financial/revenue-by-month?${range}`).subscribe({
      next: d => { this.revenueByMonth = d; check(); },
      error: () => check()
    });

    this.http.get<NameValue[]>(`${base}/financial/revenue-by-doctor?${range}`).subscribe({
      next: d => { this.revenueByDoctor = d; check(); },
      error: () => check()
    });

    this.http.get<any[]>(`${base}/invoices?start=${this.startDate}&end=${this.endDate}`).subscribe({
      next: d => { this.recentInvoices = d; check(); },
      error: () => check()
    });
  }

  pct(val: number, max: number): number { return max > 0 ? (val / max) * 100 : 0; }

  statusLabel(s: string): string {
    const m: Record<string, string> = { PAYE: 'Payé', EN_ATTENTE: 'En attente', IMPAYE: 'Impayé', PARTIEL: 'Partiel', REMBOURSE: 'Remboursé' };
    return m[s] || s;
  }

  badgeClass(s: string): string { return 'badge-' + (s || '').toLowerCase(); }

  exportPDF(): void {
    const doc = new jsPDF();
    const period = `${this.startDate} au ${this.endDate}`;

    doc.setFontSize(18);
    doc.setTextColor(30, 111, 217);
    doc.text('MediSync — Rapport Financier', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Période : ${period}`, 14, 28);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Synthèse', 14, 40);

    autoTable(doc, {
      startY: 44,
      head: [['Indicateur', 'Valeur']],
      body: [
        ["Chiffre d'affaires", `${this.stats.totalRevenue.toLocaleString('fr-MA')} DH`],
        ['Encaissé', `${this.stats.totalPaid.toLocaleString('fr-MA')} DH`],
        ['En attente', `${this.stats.totalPending.toLocaleString('fr-MA')} DH`],
        ['Impayé', `${this.stats.totalOverdue.toLocaleString('fr-MA')} DH`],
        ['Rendez-vous', String(this.stats.appointmentsCount)],
        ['Consultations', String(this.stats.consultationsCount)],
        ['Panier moyen', `${Math.round(this.averageTicket).toLocaleString('fr-MA')} DH`],
        ["Taux d'encaissement", `${Math.round(this.paymentRate)} %`],
      ],
      headStyles: { fillColor: [30, 111, 217] },
    });

    const afterSynth = (doc as any).lastAutoTable.finalY + 10;

    if (this.revenueByMonth.length > 0) {
      doc.setFontSize(12);
      doc.text('CA par mois', 14, afterSynth);
      autoTable(doc, {
        startY: afterSynth + 4,
        head: [['Mois', 'CA (DH)']],
        body: this.revenueByMonth.map(m => [m.name, `${m.value.toLocaleString('fr-MA')} DH`]),
        headStyles: { fillColor: [30, 111, 217] },
      });
    }

    const afterMonth = (doc as any).lastAutoTable.finalY + 10;

    if (this.recentInvoices.length > 0) {
      doc.setFontSize(12);
      doc.text('Dernières factures', 14, afterMonth);
      autoTable(doc, {
        startY: afterMonth + 4,
        head: [['N° Facture', 'Patient', 'Date', 'Montant', 'Statut']],
        body: this.recentInvoices.map(inv => [
          inv.numeroFacture,
          inv.patientNom,
          inv.dateFacture,
          `${inv.montantTotal} DH`,
          this.statusLabel(inv.statut),
        ]),
        headStyles: { fillColor: [30, 111, 217] },
      });
    }

    doc.save(`rapport-financier_${this.startDate}_${this.endDate}.pdf`);
  }

  exportExcel(): void {
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { Indicateur: "Chiffre d'affaires", 'Montant (DH)': this.stats.totalRevenue },
      { Indicateur: 'Encaissé', 'Montant (DH)': this.stats.totalPaid },
      { Indicateur: 'En attente', 'Montant (DH)': this.stats.totalPending },
      { Indicateur: 'Impayé', 'Montant (DH)': this.stats.totalOverdue },
      { Indicateur: 'Rendez-vous', Valeur: this.stats.appointmentsCount },
      { Indicateur: 'Consultations', Valeur: this.stats.consultationsCount },
      { Indicateur: 'Panier moyen', 'Montant (DH)': Math.round(this.averageTicket) },
      { Indicateur: "Taux d'encaissement (%)", Valeur: Math.round(this.paymentRate) },
    ]), 'Synthèse');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      this.revenueByMonth.map(m => ({ Mois: m.name, 'CA (DH)': m.value }))
    ), 'CA par mois');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      this.revenueByDoctor.map(d => ({ Médecin: d.name, 'CA (DH)': d.value }))
    ), 'CA par médecin');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      this.recentInvoices.map(inv => ({
        'N° Facture': inv.numeroFacture,
        Patient: inv.patientNom,
        Date: inv.dateFacture,
        'Montant (DH)': inv.montantTotal,
        'Payé (DH)': inv.montantPaye,
        Statut: this.statusLabel(inv.statut),
      }))
    ), 'Factures');

    XLSX.writeFile(wb, `rapport-financier_${this.startDate}_${this.endDate}.xlsx`);
  }
}
