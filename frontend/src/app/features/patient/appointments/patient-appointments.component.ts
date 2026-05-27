import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="page-header flex justify-between items-center">
        <div>
          <h1>Mes rendez-vous</h1>
          <p>Gerez vos rendez-vous medicaux</p>
        </div>
        <a routerLink="/medecins" class="btn btn-primary">Nouveau RDV</a>
      </div>

      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Heure</th>
              <th>Medecin</th>
              <th>Specialite</th>
              <th>Motif</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (apt of appointments; track apt.id) {
              <tr>
                <td>{{ apt.date }}</td>
                <td>{{ apt.heureDebut }} - {{ apt.heureFin }}</td>
                <td>Dr. {{ apt.medecinPrenom }} {{ apt.medecinNom }}</td>
                <td>{{ apt.medecinSpecialite }}</td>
                <td>{{ apt.motif }}</td>
                <td>
                  <span class="badge" [class]="'badge-' + getStatusClass(apt.statut)">
                    {{ apt.statut }}
                  </span>
                </td>
                <td>
                  @if (apt.statut === 'EN_ATTENTE' || apt.statut === 'CONFIRME') {
                    <button class="btn btn-danger btn-sm" (click)="cancelAppointment(apt.id)">
                      Annuler
                    </button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="text-center">Aucun rendez-vous</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
  `]
})
export class PatientAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getPatientAppointments().subscribe({
      next: (data) => this.appointments = data
    });
  }

  cancelAppointment(id: number): void {
    if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
      this.appointmentService.cancelPatientAppointment(id).subscribe({
        next: () => this.loadAppointments()
      });
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'CONFIRME': return 'success';
      case 'EN_ATTENTE': return 'warning';
      case 'ANNULE': return 'danger';
      case 'TERMINE': return 'info';
      default: return 'info';
    }
  }
}
