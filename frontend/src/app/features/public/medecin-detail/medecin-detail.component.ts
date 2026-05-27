import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedecinService } from '../../../core/services/medecin.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Medecin } from '../../../core/models/user.model';
import { Creneau, MotifConsultation } from '../../../core/models/appointment.model';
import { Review } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-medecin-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      @if (medecin) {
        <div class="medecin-header card">
          <div class="medecin-avatar">
            {{ medecin.prenom[0] }}{{ medecin.nom[0] }}
          </div>
          <div class="medecin-info">
            <h1>Dr. {{ medecin.prenom }} {{ medecin.nom }}</h1>
            <p class="specialite">{{ medecin.specialite }}</p>
            @if (medecin.noteMoyenne && medecin.noteMoyenne > 0) {
              <p class="rating">⭐ {{ medecin.noteMoyenne?.toFixed(1) }} ({{ medecin.nombreAvis }} avis)</p>
            }
            @if (medecin.description) {
              <p class="description">{{ medecin.description }}</p>
            }
            <div class="meta">
              @if (medecin.languesParlees) {
                <span>🗣️ {{ medecin.languesParlees }}</span>
              }
              @if (medecin.tarifConsultation) {
                <span>💶 {{ medecin.tarifConsultation }} EUR</span>
              }
              @if (medecin.dureeConsultation) {
                <span>⏱️ {{ medecin.dureeConsultation }} min</span>
              }
            </div>
          </div>
        </div>

        <div class="content-grid">
          <div class="booking-section card">
            <h2>Prendre rendez-vous</h2>

            @if (!isAuthenticated()) {
              <div class="alert alert-info">
                <a routerLink="/login">Connectez-vous</a> pour prendre rendez-vous.
              </div>
            } @else {
              <div class="form-group">
                <label>Date</label>
                <input type="date" [(ngModel)]="selectedDate" (change)="loadCreneaux()" [min]="minDate">
              </div>

              @if (creneaux.length > 0) {
                <div class="form-group">
                  <label>Creneau</label>
                  <div class="creneaux-grid">
                    @for (creneau of creneaux; track creneau.heureDebut) {
                      <button
                        class="creneau-btn"
                        [class.selected]="selectedCreneau === creneau"
                        [class.disabled]="!creneau.disponible"
                        [disabled]="!creneau.disponible"
                        (click)="selectCreneau(creneau)">
                        {{ creneau.heureDebut }}
                      </button>
                    }
                  </div>
                </div>

                @if (selectedCreneau) {
                  <div class="form-group">
                    <label>Motif</label>
                    <select [(ngModel)]="selectedMotif">
                      <option value="CONSULTATION_GENERALE">Consultation generale</option>
                      <option value="SUIVI">Suivi</option>
                      <option value="URGENCE">Urgence</option>
                      <option value="VACCINATION">Vaccination</option>
                      <option value="CERTIFICAT_MEDICAL">Certificat medical</option>
                      <option value="RENOUVELLEMENT_ORDONNANCE">Renouvellement ordonnance</option>
                    </select>
                  </div>

                  <button class="btn btn-primary btn-block" (click)="bookAppointment()" [disabled]="booking">
                    {{ booking ? 'Reservation...' : 'Confirmer le rendez-vous' }}
                  </button>
                }
              } @else if (selectedDate) {
                <p class="no-creneaux">Aucun creneau disponible pour cette date.</p>
              }

              @if (bookingSuccess) {
                <div class="alert alert-success mt-4">
                  Rendez-vous confirme ! Vous recevrez un email de confirmation.
                </div>
              }

              @if (bookingError) {
                <div class="alert alert-danger mt-4">{{ bookingError }}</div>
              }
            }
          </div>

          <div class="reviews-section card">
            <h2>Avis patients</h2>
            @for (review of reviews; track review.id) {
              <div class="review">
                <div class="review-header">
                  <span class="review-author">{{ review.patientNom }}</span>
                  <span class="review-rating">
                    @for (i of [1,2,3,4,5]; track i) {
                      {{ i <= review.note ? '⭐' : '☆' }}
                    }
                  </span>
                </div>
                @if (review.commentaire) {
                  <p class="review-text">{{ review.commentaire }}</p>
                }
              </div>
            } @empty {
              <p class="no-reviews">Aucun avis pour le moment.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .medecin-header {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;

      @media (max-width: 640px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }

    .medecin-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .medecin-info {
      h1 {
        font-size: 1.75rem;
        margin-bottom: 0.25rem;
      }

      .specialite {
        color: var(--primary);
        font-weight: 500;
      }

      .rating {
        margin-top: 0.5rem;
      }

      .description {
        margin-top: 1rem;
        color: var(--gray-600);
      }

      .meta {
        display: flex;
        gap: 1.5rem;
        margin-top: 1rem;
        flex-wrap: wrap;

        span {
          color: var(--gray-500);
          font-size: 0.875rem;
        }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .booking-section h2, .reviews-section h2 {
      margin-bottom: 1.5rem;
      font-size: 1.25rem;
    }

    .creneaux-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    .creneau-btn {
      padding: 0.5rem;
      border: 1px solid var(--gray-300);
      border-radius: 0.375rem;
      background: white;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        border-color: var(--primary);
      }

      &.selected {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }

      &.disabled, &:disabled {
        background: var(--gray-100);
        color: var(--gray-400);
        cursor: not-allowed;
      }
    }

    .no-creneaux, .no-reviews {
      color: var(--gray-500);
      text-align: center;
      padding: 1rem;
    }

    .review {
      padding: 1rem 0;
      border-bottom: 1px solid var(--gray-200);

      &:last-child {
        border-bottom: none;
      }
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .review-author {
      font-weight: 500;
    }

    .review-text {
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    .btn-block {
      width: 100%;
      margin-top: 1rem;
    }
  `]
})
export class MedecinDetailComponent implements OnInit {
  medecin: Medecin | null = null;
  reviews: Review[] = [];
  creneaux: Creneau[] = [];
  selectedDate = '';
  selectedCreneau: Creneau | null = null;
  selectedMotif: MotifConsultation = 'CONSULTATION_GENERALE';
  minDate = new Date().toISOString().split('T')[0];
  booking = false;
  bookingSuccess = false;
  bookingError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private medecinService: MedecinService,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMedecin(id);
    this.loadReviews(id);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadMedecin(id: number): void {
    this.medecinService.getMedecinById(id).subscribe({
      next: (data) => this.medecin = data
    });
  }

  loadReviews(id: number): void {
    this.medecinService.getMedecinReviews(id).subscribe({
      next: (data) => this.reviews = data
    });
  }

  loadCreneaux(): void {
    if (!this.medecin || !this.selectedDate) return;

    this.selectedCreneau = null;
    this.medecinService.getCreneauxDisponibles(this.medecin.id, this.selectedDate).subscribe({
      next: (data) => this.creneaux = data
    });
  }

  selectCreneau(creneau: Creneau): void {
    if (creneau.disponible) {
      this.selectedCreneau = creneau;
    }
  }

  bookAppointment(): void {
    if (!this.medecin || !this.selectedCreneau) return;

    this.booking = true;
    this.bookingError = '';
    this.bookingSuccess = false;

    this.appointmentService.createPatientAppointment({
      medecinId: this.medecin.id,
      date: this.selectedDate,
      heureDebut: this.selectedCreneau.heureDebut,
      motif: this.selectedMotif
    }).subscribe({
      next: () => {
        this.bookingSuccess = true;
        this.booking = false;
        this.selectedCreneau = null;
        this.loadCreneaux();
      },
      error: (err) => {
        this.bookingError = err.error?.error || 'Erreur lors de la reservation';
        this.booking = false;
      }
    });
  }
}
