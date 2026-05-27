import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedecinService } from '../../../core/services/medecin.service';
import { Disponibilite } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-medecin-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Mon planning</h1>
        <p>Gerez vos disponibilites et conges</p>
      </div>

      <div class="content-grid">
        <div class="card">
          <h2>Disponibilites recurrentes</h2>
          @for (dispo of disponibilites; track dispo.id) {
            <div class="dispo-item">
              <span class="jour">{{ dispo.jourSemaine }}</span>
              <span class="horaires">{{ dispo.heureDebut }} - {{ dispo.heureFin }}</span>
              @if (dispo.estConge) {
                <span class="badge badge-warning">Conge</span>
              }
            </div>
          } @empty {
            <p class="empty-state">Aucune disponibilite configuree</p>
          }
        </div>

        <div class="card">
          <h2>Ajouter une disponibilite</h2>
          <form (ngSubmit)="addDisponibilite()">
            <div class="form-group">
              <label>Jour de la semaine</label>
              <select [(ngModel)]="newDispo.jourSemaine" name="jour">
                <option value="MONDAY">Lundi</option>
                <option value="TUESDAY">Mardi</option>
                <option value="WEDNESDAY">Mercredi</option>
                <option value="THURSDAY">Jeudi</option>
                <option value="FRIDAY">Vendredi</option>
                <option value="SATURDAY">Samedi</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Heure debut</label>
                <input type="time" [(ngModel)]="newDispo.heureDebut" name="heureDebut">
              </div>
              <div class="form-group">
                <label>Heure fin</label>
                <input type="time" [(ngModel)]="newDispo.heureFin" name="heureFin">
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="newDispo.estConge" name="estConge">
                Marquer comme conge
              </label>
            </div>

            <button type="submit" class="btn btn-primary">Ajouter</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    h2 {
      margin-bottom: 1rem;
    }

    .dispo-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--gray-100);

      .jour {
        font-weight: 500;
        min-width: 100px;
      }

      .horaires {
        color: var(--gray-600);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;

      input {
        width: auto;
      }
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--gray-500);
    }
  `]
})
export class MedecinPlanningComponent implements OnInit {
  disponibilites: Disponibilite[] = [];
  newDispo: Partial<Disponibilite> = {
    jourSemaine: 'MONDAY',
    heureDebut: '09:00',
    heureFin: '12:00',
    estConge: false,
    recurrent: true
  };

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
    this.loadDisponibilites();
  }

  loadDisponibilites(): void {
    this.medecinService.getDisponibilites().subscribe({
      next: (data) => this.disponibilites = data
    });
  }

  addDisponibilite(): void {
    this.medecinService.addDisponibilite(this.newDispo as Disponibilite).subscribe({
      next: () => {
        this.loadDisponibilites();
        this.newDispo = {
          jourSemaine: 'MONDAY',
          heureDebut: '09:00',
          heureFin: '12:00',
          estConge: false,
          recurrent: true
        };
      }
    });
  }
}
