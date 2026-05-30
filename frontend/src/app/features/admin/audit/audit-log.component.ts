import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface AuditLog {
  id: number;
  utilisateur: string;
  action: string;
  entite?: string;
  entiteId?: number;
  details?: string;
  adresseIp?: string;
  timestamp: string;
}

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audit-page">
      <header class="page-header">
        <div>
          <h1>Journal d'audit</h1>
          <p>Traçabilité des actions sensibles du système</p>
        </div>
      </header>

      <div class="filters">
        <div class="filter">
          <label>Type d'action</label>
          <select [(ngModel)]="actionFilter" (change)="load()">
            <option value="">Toutes les actions</option>
            @for (a of actionTypes; track a) {
              <option [value]="a">{{ a }}</option>
            }
          </select>
        </div>
        <div class="filter">
          <label>Du</label>
          <input type="date" [(ngModel)]="fromDate" (change)="load()">
        </div>
        <div class="filter">
          <label>Au</label>
          <input type="date" [(ngModel)]="toDate" (change)="load()">
        </div>
        <button class="btn-reset" (click)="reset()">Réinitialiser</button>
      </div>

      <div class="table-card">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Date / Heure</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Détails</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            @for (log of logs; track log.id) {
              <tr>
                <td>{{ log.timestamp | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ log.utilisateur }}</td>
                <td><span class="action-badge">{{ log.action }}</span></td>
                <td class="details-cell">
                  {{ log.details || (log.entite ? log.entite + ' #' + log.entiteId : '—') }}
                </td>
                <td class="ip-cell">{{ log.adresseIp || '—' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty">Aucune entrée d'audit pour ces critères.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .audit-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 6px; }
    .page-header p { margin: 0; color: #666; }
    .filters { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .filter { display: flex; flex-direction: column; gap: 6px; }
    .filter label { font-size: 12px; color: #666; font-weight: 500; }
    .filter select, .filter input { padding: 9px 12px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; }
    .btn-reset { padding: 9px 16px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; font-weight: 500; color: #475569; }
    .table-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
    .audit-table { width: 100%; border-collapse: collapse; }
    .audit-table th, .audit-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
    .audit-table th { font-size: 12px; text-transform: uppercase; color: #666; font-weight: 600; background: #fafafa; }
    .action-badge { background: #EAF2FD; color: #1E6FD9; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .details-cell { color: #475569; }
    .ip-cell { color: #94a3b8; font-family: monospace; font-size: 13px; }
    .empty { text-align: center; color: #94a3b8; padding: 32px; }
  `]
})
export class AuditLogComponent implements OnInit {
  logs: AuditLog[] = [];
  actionFilter = '';
  fromDate = '';
  toDate = '';

  actionTypes = ['CONNEXION', 'CREATION', 'MODIFICATION', 'SUPPRESSION', 'CONSULTATION_DOSSIER', 'PAIEMENT'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    let params = new HttpParams();
    if (this.actionFilter) params = params.set('action', this.actionFilter);
    if (this.fromDate && this.toDate) {
      params = params.set('from', this.fromDate).set('to', this.toDate);
    }
    this.http.get<AuditLog[]>(`${environment.apiUrl}/admin/audit`, { params }).subscribe({
      next: data => this.logs = data,
      error: () => this.logs = []
    });
  }

  reset(): void {
    this.actionFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.load();
  }
}
