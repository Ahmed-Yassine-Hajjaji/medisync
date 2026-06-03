import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PatientService } from '../../../core/services/patient.service';
import { Invoice, StatutPaiement } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-patient-invoices',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule],
  template: `
    <div class="page-header">
      <h1>Mes factures</h1>
      <p class="text-muted">Historique et suivi de vos factures</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card" style="--bg: #EFF6FF; --fg: #1E6FD9;">
        <div class="kpi-number">{{ invoices.length }}</div>
        <div class="kpi-label">Total factures</div>
      </div>
      <div class="kpi-card" style="--bg: #ECFDF5; --fg: #059669;">
        <div class="kpi-number">{{ formatMad(totalPaid) }}</div>
        <div class="kpi-label">Total paye</div>
      </div>
      <div class="kpi-card" style="--bg: #FEF3C7; --fg: #B45309;">
        <div class="kpi-number">{{ formatMad(totalDue) }}</div>
        <div class="kpi-label">Reste a payer</div>
      </div>
    </div>

    <div class="table-card">
      <p-table [value]="invoices" [paginator]="true" [rows]="10" [loading]="loading"
               styleClass="minimal-table" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th>N Facture</th>
            <th>Date</th>
            <th>Echeance</th>
            <th class="num">Montant</th>
            <th class="num">Paye</th>
            <th class="num">Reste</th>
            <th>Statut</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td><strong>{{ row.numeroFacture }}</strong></td>
            <td>{{ row.dateFacture }}</td>
            <td>{{ row.dateEcheance || '-' }}</td>
            <td class="num">{{ formatMad(row.montantTotal) }}</td>
            <td class="num">{{ formatMad(row.montantPaye) }}</td>
            <td class="num"><strong>{{ formatMad(row.montantTotal - row.montantPaye) }}</strong></td>
            <td>
              <p-tag [value]="statutLabel(row.statut)" [severity]="statutSeverity(row.statut)"></p-tag>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="empty-cell">Aucune facture</td></tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
    .text-muted { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 0; }

    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .kpi-card {
      background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem;
      text-align: center;
    }
    .kpi-number { font-size: 1.5rem; font-weight: 700; color: var(--fg); line-height: 1.2; }
    .kpi-label { font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem; }

    .table-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    :host ::ng-deep .minimal-table .p-datatable-thead > tr > th {
      background: #f8fafc; color: #475569; font-weight: 600; font-size: 0.75rem;
      text-transform: uppercase; letter-spacing: 0.04em; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;
    }
    :host ::ng-deep .minimal-table .p-datatable-thead > tr > th.num { text-align: right; }
    :host ::ng-deep .minimal-table .p-datatable-tbody > tr > td {
      padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem;
    }
    :host ::ng-deep .minimal-table .p-datatable-tbody > tr > td.num { text-align: right; font-variant-numeric: tabular-nums; }
    :host ::ng-deep .minimal-table .p-datatable-tbody > tr:hover { background: #f8fafc; }
    .empty-cell { text-align: center; padding: 2rem; color: #94a3b8; }
  `]
})
export class PatientInvoicesComponent implements OnInit {
  loading = false;
  invoices: Invoice[] = [];
  totalPaid = 0;
  totalDue = 0;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.patientService.getInvoices().subscribe({
      next: list => {
        this.invoices = list;
        this.totalPaid = list.reduce((s, i) => s + Number(i.montantPaye || 0), 0);
        this.totalDue = list.reduce((s, i) => s + (Number(i.montantTotal || 0) - Number(i.montantPaye || 0)), 0);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  formatMad(n: number): string {
    return `${new Intl.NumberFormat('fr-MA').format(Math.round(Number(n) || 0))} DH`;
  }

  statutLabel(s: StatutPaiement): string {
    switch (s) {
      case 'PAYE': return 'Payee';
      case 'PARTIEL': return 'Partiel';
      case 'EN_ATTENTE': return 'En attente';
      case 'IMPAYE': return 'Impayee';
      case 'REMBOURSE': return 'Remboursee';
      default: return s;
    }
  }

  statutSeverity(s: StatutPaiement): 'success' | 'warning' | 'danger' | 'info' {
    switch (s) {
      case 'PAYE': return 'success';
      case 'PARTIEL': return 'warning';
      case 'IMPAYE': return 'danger';
      default: return 'info';
    }
  }
}
