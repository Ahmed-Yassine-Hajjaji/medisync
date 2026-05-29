import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LucideDynamicIcon, LucideBanknote, LucideClock, LucideCheckCircle2, LucideReceipt, LucideCreditCard } from '@lucide/angular';

import { PatientService } from '../../../core/services/patient.service';
import { Invoice, StatutPaiement } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-secretaire-billing',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, DialogModule, DropdownModule, TagModule, ToastModule,
    LucideDynamicIcon
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="page-header">
      <div>
        <h1>Facturation</h1>
        <p class="text-muted">Suivi des factures et paiements.</p>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card" style="--bg: #EFF6FF; --fg: #1E6FD9;">
        <div class="kpi-icon"><svg [lucideIcon]="iconReceipt" [size]="20"></svg></div>
        <div>
          <div class="kpi-number">{{ invoices.length }}</div>
          <div class="kpi-label">Total factures</div>
        </div>
      </div>
      <div class="kpi-card" style="--bg: #ECFDF5; --fg: #059669;">
        <div class="kpi-icon"><svg [lucideIcon]="iconCheck" [size]="20"></svg></div>
        <div>
          <div class="kpi-number">{{ formatMad(totalPaid) }}</div>
          <div class="kpi-label">Payé ce mois</div>
        </div>
      </div>
      <div class="kpi-card" style="--bg: #FEF3C7; --fg: #B45309;">
        <div class="kpi-icon"><svg [lucideIcon]="iconClock" [size]="20"></svg></div>
        <div>
          <div class="kpi-number">{{ formatMad(totalDue) }}</div>
          <div class="kpi-label">En attente</div>
        </div>
      </div>
      <div class="kpi-card" style="--bg: #F5F3FF; --fg: #7C3AED;">
        <div class="kpi-icon"><svg [lucideIcon]="iconBank" [size]="20"></svg></div>
        <div>
          <div class="kpi-number">{{ unpaidCount }}</div>
          <div class="kpi-label">Factures impayées</div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <p-table [value]="invoices" [paginator]="true" [rows]="15" [loading]="loading"
               styleClass="minimal-table" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th>N° Facture</th>
            <th>Patient</th>
            <th>Date</th>
            <th class="num">Total</th>
            <th class="num">Payé</th>
            <th class="num">Reste</th>
            <th>Statut</th>
            <th style="width: 90px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td><strong>{{ row.numeroFacture }}</strong></td>
            <td>{{ row.patientNom }}</td>
            <td>{{ row.dateFacture }}</td>
            <td class="num">{{ formatMad(row.montantTotal) }}</td>
            <td class="num">{{ formatMad(row.montantPaye) }}</td>
            <td class="num"><strong>{{ formatMad(row.montantTotal - row.montantPaye) }}</strong></td>
            <td>
              <p-tag [value]="statutLabel(row.statut)" [severity]="statutSeverity(row.statut)"></p-tag>
            </td>
            <td>
              @if (row.statut !== 'PAYE' && row.statut !== 'REMBOURSE') {
                <button class="icon-btn ok" title="Enregistrer paiement" (click)="openPayment(row)">
                  <svg [lucideIcon]="iconPay" [size]="14"></svg>
                </button>
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="8" class="empty-cell">Aucune facture</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog header="Enregistrer un paiement" [(visible)]="showPayment" [modal]="true"
              [style]="{ width: '480px' }" [draggable]="false">
      @if (currentInvoice) {
        <div class="dialog-form">
          <div class="invoice-summary">
            <div><span class="text-muted">Facture</span><strong>{{ currentInvoice.numeroFacture }}</strong></div>
            <div><span class="text-muted">Patient</span><strong>{{ currentInvoice.patientNom }}</strong></div>
            <div><span class="text-muted">Reste à payer</span>
              <strong class="amount-due">{{ formatMad(currentInvoice.montantTotal - currentInvoice.montantPaye) }}</strong>
            </div>
          </div>
          <div class="form-group">
            <label>Montant (DH) *</label>
            <input type="number" [(ngModel)]="paymentAmount" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label>Mode de paiement *</label>
            <p-dropdown [options]="modePaiementOptions" [(ngModel)]="paymentMode"
                        optionLabel="label" optionValue="value" placeholder="Choisir..."
                        styleClass="w-full"></p-dropdown>
          </div>
        </div>
      }
      <ng-template pTemplate="footer">
        <button class="btn-secondary" (click)="showPayment = false">Annuler</button>
        <button class="btn-primary" (click)="processPayment()" [disabled]="!canPay()">Valider</button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host { display: block; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
    .page-header p { margin: 0.25rem 0 0; }
    .text-muted { color: #64748b; font-size: 0.875rem; }

    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem;
      display: flex; align-items: center; gap: 1rem;
    }
    .kpi-icon {
      width: 44px; height: 44px; border-radius: 10px; background: var(--bg); color: var(--fg);
      display: flex; align-items: center; justify-content: center;
    }
    .kpi-number { font-size: 1.5rem; font-weight: 700; color: #0f172a; line-height: 1.2; }
    .kpi-label { font-size: 0.8125rem; color: #64748b; margin-top: 0.125rem; }

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

    .icon-btn {
      width: 28px; height: 28px; border-radius: 6px; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; transition: transform 0.15s;
    }
    .icon-btn:hover { transform: scale(1.08); }
    .icon-btn.ok { background: #ECFDF5; color: #059669; }
    .empty-cell { text-align: center; padding: 2rem; color: #94a3b8; }

    .btn-primary { background: #1E6FD9; color: white; border: none; border-radius: 8px;
      padding: 0.5rem 1rem; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #1859B3; }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-secondary { background: transparent; color: #475569; border: 1px solid #e2e8f0;
      border-radius: 8px; padding: 0.5rem 1rem; font-weight: 500; cursor: pointer; margin-right: 0.5rem; }

    .dialog-form { padding: 0.5rem 0; }
    .invoice-summary {
      background: #f8fafc; border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem;
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
    }
    .invoice-summary span { display: block; font-size: 0.75rem; margin-bottom: 0.125rem; }
    .invoice-summary strong { display: block; color: #0f172a; font-size: 0.9375rem; }
    .invoice-summary .amount-due { color: #B45309; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 500; color: #334155; margin-bottom: 0.375rem; font-size: 0.875rem; }
    .form-group input {
      width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 0.875rem; font-family: inherit;
    }
    .form-group input:focus { outline: none; border-color: #1E6FD9; }
  `]
})
export class SecretaireBillingComponent implements OnInit {
  iconReceipt = LucideReceipt.icon;
  iconClock = LucideClock.icon;
  iconCheck = LucideCheckCircle2.icon;
  iconBank = LucideBanknote.icon;
  iconPay = LucideCreditCard.icon;

  loading = false;
  invoices: Invoice[] = [];
  totalPaid = 0;
  totalDue = 0;
  unpaidCount = 0;

  showPayment = false;
  currentInvoice: Invoice | null = null;
  paymentAmount = 0;
  paymentMode = '';

  modePaiementOptions = [
    { label: 'Espèces', value: 'ESPECES' },
    { label: 'Carte bancaire', value: 'CARTE' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Virement', value: 'VIREMENT' }
  ];

  constructor(
    private patientService: PatientService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.patientService.getAllInvoicesBySecretaire().subscribe({
      next: list => {
        this.invoices = list;
        this.computeKpis();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  computeKpis(): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    this.totalPaid = 0;
    this.totalDue = 0;
    this.unpaidCount = 0;
    for (const inv of this.invoices) {
      const d = new Date(inv.dateFacture);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        this.totalPaid += Number(inv.montantPaye || 0);
      }
      const reste = Number(inv.montantTotal || 0) - Number(inv.montantPaye || 0);
      if (reste > 0) {
        this.totalDue += reste;
        this.unpaidCount++;
      }
    }
  }

  openPayment(inv: Invoice): void {
    this.currentInvoice = inv;
    this.paymentAmount = Number(inv.montantTotal) - Number(inv.montantPaye);
    this.paymentMode = '';
    this.showPayment = true;
  }

  canPay(): boolean {
    return !!this.currentInvoice && this.paymentAmount > 0 && !!this.paymentMode;
  }

  processPayment(): void {
    if (!this.canPay() || !this.currentInvoice) return;
    this.patientService.recordPayment(this.currentInvoice.id, this.paymentAmount, this.paymentMode).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Paiement enregistré', detail: `${this.formatMad(this.paymentAmount)} reçus` });
        this.showPayment = false;
        this.load();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec enregistrement' })
    });
  }

  formatMad(n: number): string {
    return `${new Intl.NumberFormat('fr-MA').format(Math.round(Number(n) || 0))} DH`;
  }

  statutLabel(s: StatutPaiement): string {
    switch (s) {
      case 'PAYE': return 'Payée';
      case 'PARTIEL': return 'Partiel';
      case 'EN_ATTENTE': return 'En attente';
      case 'IMPAYE': return 'Impayée';
      case 'REMBOURSE': return 'Remboursée';
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
