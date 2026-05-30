import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedecinService } from '../../../core/services/medecin.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../../core/services/patient.service';
import { Medecin, Patient } from '../../../core/models/user.model';
import { Creneau, MotifConsultation } from '../../../core/models/appointment.model';
import { Review } from '../../../core/models/consultation.model';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  dayName: string;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-medecin-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      @if (medecin) {
        <!-- Medecin Header -->
        <div class="medecin-header card">
          <div class="medecin-avatar">
            {{ medecin.prenom[0] }}{{ medecin.nom[0] }}
          </div>
          <div class="medecin-info">
            <h1>Dr. {{ medecin.prenom }} {{ medecin.nom }}</h1>
            <p class="specialite">{{ medecin.specialite }}</p>
            @if (medecin.noteMoyenne && medecin.noteMoyenne > 0) {
              <div class="rating">
                <div class="stars">
                  @for (i of [1,2,3,4,5]; track i) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                         [attr.fill]="i <= medecin.noteMoyenne! ? '#F59E0B' : 'none'"
                         [attr.stroke]="i <= medecin.noteMoyenne! ? '#F59E0B' : '#D1D5DB'"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  }
                </div>
                <span>{{ medecin.noteMoyenne?.toFixed(1) }} ({{ medecin.nombreAvis }} avis)</span>
              </div>
            }
            @if (medecin.description) {
              <p class="description">{{ medecin.description }}</p>
            }
            <div class="meta">
              @if (medecin.languesParlees) {
                <span class="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m5 8 6 6"/>
                    <path d="m4 14 6-6 2-3"/>
                    <path d="M2 5h12"/>
                    <path d="M7 2h1"/>
                    <path d="m22 22-5-10-5 10"/>
                    <path d="M14 18h6"/>
                  </svg>
                  {{ medecin.languesParlees }}
                </span>
              }
              @if (medecin.tarifConsultation) {
                <span class="meta-item price">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                    <path d="M12 18V6"/>
                  </svg>
                  {{ medecin.tarifConsultation }} DH
                </span>
              }
              @if (medecin.dureeConsultation) {
                <span class="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ medecin.dureeConsultation }} min
                </span>
              }
            </div>
          </div>
        </div>

        <div class="content-grid">
          <!-- Booking Section -->
          <div class="booking-section card">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 2v4"/>
                <path d="M16 2v4"/>
                <rect width="18" height="18" x="3" y="4" rx="2"/>
                <path d="M3 10h18"/>
              </svg>
              Prendre rendez-vous
            </h2>

            @if (!isAuthenticated()) {
              <div class="auth-prompt">
                <div class="auth-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="5"/>
                    <path d="M20 21a8 8 0 0 0-16 0"/>
                  </svg>
                </div>
                <p>Connectez-vous pour prendre rendez-vous</p>
                <a routerLink="/login" class="btn btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Se connecter
                </a>
              </div>
            } @else {
              <!-- Week Calendar -->
              <div class="calendar-section">
                <div class="calendar-header">
                  <button class="nav-btn" (click)="previousWeek()" [disabled]="!canGoPrevious()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </button>
                  <span class="week-label">{{ getWeekLabel() }}</span>
                  <button class="nav-btn" (click)="nextWeek()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                </div>

                <div class="calendar-days">
                  @for (day of calendarDays; track day.date) {
                    <button
                      class="day-btn"
                      [class.today]="day.isToday"
                      [class.selected]="day.isSelected"
                      [class.past]="day.isPast"
                      [disabled]="day.isPast"
                      (click)="selectDay(day)">
                      <span class="day-name">{{ day.dayName }}</span>
                      <span class="day-number">{{ day.dayNumber }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Time Slots -->
              @if (selectedDate) {
                <div class="slots-section">
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Horaires disponibles
                  </h3>

                  @if (loadingSlots) {
                    <div class="loading-slots">
                      <div class="spinner-small"></div>
                      <span>Chargement...</span>
                    </div>
                  } @else if (creneaux.length > 0) {
                    <div class="creneaux-grid">
                      @for (creneau of creneaux; track creneau.heureDebut) {
                        <button
                          class="creneau-btn"
                          [class.selected]="selectedCreneau === creneau"
                          [class.unavailable]="!creneau.disponible"
                          [disabled]="!creneau.disponible"
                          (click)="selectCreneau(creneau)">
                          {{ creneau.heureDebut }}
                        </button>
                      }
                    </div>
                  } @else {
                    <div class="no-slots">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m15 9-6 6"/>
                        <path d="m9 9 6 6"/>
                      </svg>
                      <p>Aucun creneau disponible pour cette date</p>
                    </div>
                  }
                </div>
              }

              <!-- Motif & Confirmation -->
              @if (selectedCreneau) {
                <div class="booking-form">
                  @if (dependants.length > 0) {
                    <div class="form-group">
                      <label>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Pour qui ?
                      </label>
                      <select [(ngModel)]="selectedPatientId" class="select-motif">
                        <option [ngValue]="null">Pour moi</option>
                        @for (dep of dependants; track dep.id) {
                          <option [ngValue]="dep.id">{{ dep.prenom }} {{ dep.nom }}</option>
                        }
                      </select>
                    </div>
                  }
                  <div class="form-group">
                    <label>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <path d="M14 2v6h6"/>
                        <path d="M16 13H8"/>
                        <path d="M16 17H8"/>
                        <path d="M10 9H8"/>
                      </svg>
                      Motif de consultation
                    </label>
                    <select [(ngModel)]="selectedMotif" class="select-motif">
                      <option value="CONSULTATION_GENERALE">Consultation generale</option>
                      <option value="SUIVI">Suivi</option>
                      <option value="URGENCE">Urgence</option>
                      <option value="VACCINATION">Vaccination</option>
                      <option value="CERTIFICAT_MEDICAL">Certificat medical</option>
                      <option value="RENOUVELLEMENT_ORDONNANCE">Renouvellement ordonnance</option>
                    </select>
                  </div>

                  <div class="booking-summary">
                    <div class="summary-row">
                      <span>Date</span>
                      <strong>{{ formatSelectedDate() }}</strong>
                    </div>
                    <div class="summary-row">
                      <span>Heure</span>
                      <strong>{{ selectedCreneau.heureDebut }}</strong>
                    </div>
                    <div class="summary-row">
                      <span>Tarif</span>
                      <strong>{{ medecin.tarifConsultation }} DH</strong>
                    </div>
                  </div>

                  <button class="btn btn-primary btn-block" (click)="bookAppointment()" [disabled]="booking">
                    @if (booking) {
                      <div class="spinner-small"></div>
                      Reservation en cours...
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      Confirmer le rendez-vous
                    }
                  </button>
                </div>
              }

              @if (bookingSuccess) {
                <div class="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Rendez-vous confirme ! Vous recevrez un email de confirmation.
                </div>
              }

              @if (bookingError) {
                <div class="alert alert-danger">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {{ bookingError }}
                </div>
              }
            }
          </div>

          <!-- Reviews Section -->
          <div class="reviews-section card">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Avis patients
            </h2>

            @if (reviews.length === 0) {
              <div class="empty-reviews">
                <div class="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p>Aucun avis pour le moment</p>
                <span>Soyez le premier a donner votre avis apres votre consultation</span>
              </div>
            } @else {
              @for (review of reviews; track review.id) {
                <div class="review">
                  <div class="review-header">
                    <div class="review-author">
                      <div class="author-avatar">{{ getInitials(review.patientNom || '') }}</div>
                      <span>{{ review.patientNom }}</span>
                    </div>
                    <div class="review-rating">
                      @for (i of [1,2,3,4,5]; track i) {
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                             [attr.fill]="i <= review.note ? '#F59E0B' : 'none'"
                             [attr.stroke]="i <= review.note ? '#F59E0B' : '#D1D5DB'"
                             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      }
                    </div>
                  </div>
                  @if (review.commentaire) {
                    <p class="review-text">{{ review.commentaire }}</p>
                  }
                </div>
              }
            }
          </div>
        </div>
      } @else {
        <div class="loading-page">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    /* Medecin Header */
    .medecin-header {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      padding: 1.5rem;

      @media (max-width: 640px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }

    .medecin-avatar {
      width: 100px;
      height: 100px;
      border-radius: var(--radius-full);
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .medecin-info {
      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 0.25rem 0;
        color: var(--gray-900);
      }

      .specialite {
        color: var(--primary);
        font-weight: 500;
        margin: 0;
      }

      .rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.75rem;

        .stars {
          display: flex;
          gap: 2px;
        }

        span {
          font-size: 0.875rem;
          color: var(--gray-600);
        }
      }

      .description {
        margin-top: 1rem;
        color: var(--gray-600);
        line-height: 1.5;
      }

      .meta {
        display: flex;
        gap: 1.5rem;
        margin-top: 1rem;
        flex-wrap: wrap;

        @media (max-width: 640px) {
          justify-content: center;
        }
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: var(--gray-500);
        font-size: 0.875rem;

        &.price {
          color: var(--primary);
          font-weight: 600;
        }
      }
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      padding: 1.5rem;
    }

    /* Section Headers */
    .booking-section h2,
    .reviews-section h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    /* Auth Prompt */
    .auth-prompt {
      text-align: center;
      padding: 2rem 1rem;

      .auth-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 1rem;
        background: var(--primary-light);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
      }

      p {
        margin: 0 0 1rem 0;
        color: var(--gray-600);
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    /* Calendar */
    .calendar-section {
      margin-bottom: 1.5rem;
    }

    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      .week-label {
        font-weight: 500;
        color: var(--gray-700);
      }

      .nav-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--gray-50);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-md);
        color: var(--gray-600);
        cursor: pointer;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: var(--gray-100);
          color: var(--gray-900);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
    }

    .day-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem 0.5rem;
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;

      .day-name {
        font-size: 0.75rem;
        color: var(--gray-500);
        text-transform: uppercase;
        margin-bottom: 0.25rem;
      }

      .day-number {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
      }

      &:hover:not(:disabled) {
        border-color: var(--primary);
        background: var(--primary-light);
      }

      &.today {
        border-color: var(--primary);

        .day-number {
          color: var(--primary);
        }
      }

      &.selected {
        background: var(--primary);
        border-color: var(--primary);

        .day-name, .day-number {
          color: white;
        }
      }

      &.past, &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background: var(--gray-50);
      }
    }

    /* Time Slots */
    .slots-section {
      margin-bottom: 1.5rem;

      h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--gray-700);
        margin: 0 0 1rem 0;
      }
    }

    .loading-slots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      color: var(--gray-500);
    }

    .spinner-small {
      width: 18px;
      height: 18px;
      border: 2px solid var(--gray-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .creneaux-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;

      @media (max-width: 500px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .creneau-btn {
      padding: 0.625rem 0.5rem;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      background: var(--white);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        border-color: var(--primary);
        color: var(--primary);
      }

      &.selected {
        background: var(--primary);
        border-color: var(--primary);
        color: white;
      }

      &.unavailable, &:disabled {
        background: var(--gray-50);
        color: var(--gray-400);
        cursor: not-allowed;
        text-decoration: line-through;
      }
    }

    .no-slots {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      color: var(--gray-500);
      text-align: center;

      svg {
        margin-bottom: 0.5rem;
        color: var(--gray-400);
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }

    /* Booking Form */
    .booking-form {
      border-top: 1px solid var(--gray-100);
      padding-top: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--gray-700);
        margin-bottom: 0.5rem;
      }
    }

    .select-motif {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-family: inherit;
      color: var(--gray-700);
      background: var(--white);
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--primary-light);
      }
    }

    .booking-summary {
      background: var(--gray-50);
      border-radius: var(--radius-md);
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--gray-200);

      &:last-child {
        border-bottom: none;
      }

      span {
        color: var(--gray-500);
        font-size: 0.875rem;
      }

      strong {
        color: var(--gray-900);
        font-size: 0.875rem;
      }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      border: none;

      &.btn-primary {
        background: var(--primary);
        color: white;

        &:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }

      &.btn-block {
        width: 100%;
      }
    }

    /* Alerts */
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--radius-md);
      margin-top: 1rem;

      &.alert-success {
        background: #DCFCE7;
        color: #16A34A;
      }

      &.alert-danger {
        background: #FEE2E2;
        color: #DC2626;
      }
    }

    /* Reviews */
    .empty-reviews {
      text-align: center;
      padding: 2rem 1rem;

      .empty-icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 1rem;
        background: var(--gray-100);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gray-400);
      }

      p {
        margin: 0;
        font-weight: 500;
        color: var(--gray-700);
      }

      span {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: var(--gray-500);
      }
    }

    .review {
      padding: 1rem 0;
      border-bottom: 1px solid var(--gray-100);

      &:last-child {
        border-bottom: none;
      }
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .review-author {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .author-avatar {
        width: 32px;
        height: 32px;
        background: var(--gray-200);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--gray-600);
      }

      span {
        font-weight: 500;
        color: var(--gray-900);
      }
    }

    .review-rating {
      display: flex;
      gap: 2px;
    }

    .review-text {
      color: var(--gray-600);
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 0;
      padding-left: 2.5rem;
    }

    /* Loading */
    .loading-page {
      text-align: center;
      padding: 4rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }
  `]
})
export class MedecinDetailComponent implements OnInit {
  medecin: Medecin | null = null;
  reviews: Review[] = [];
  creneaux: Creneau[] = [];
  calendarDays: CalendarDay[] = [];
  currentWeekStart: Date = new Date();
  selectedDate = '';
  selectedCreneau: Creneau | null = null;
  selectedMotif: MotifConsultation = 'CONSULTATION_GENERALE';
  dependants: Patient[] = [];
  selectedPatientId: number | null = null;
  booking = false;
  bookingSuccess = false;
  bookingError = '';
  loadingSlots = false;

  private dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  private monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private medecinService: MedecinService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMedecin(id);
    this.loadReviews(id);
    this.initCalendar();
    if (this.isAuthenticated()) {
      this.loadDependants();
    }
  }

  loadDependants(): void {
    this.patientService.getDependants().subscribe({
      next: (data) => this.dependants = data,
      error: () => this.dependants = []
    });
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

  initCalendar(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from today
    this.currentWeekStart = new Date(today);
    this.generateCalendarDays();
  }

  generateCalendarDays(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.calendarDays = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);

      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      const dateStr = this.formatDateForApi(date);

      this.calendarDays.push({
        date: date,
        dayNumber: date.getDate(),
        dayName: this.dayNames[date.getDay()],
        isToday,
        isPast,
        isSelected: this.selectedDate === dateStr
      });
    }
  }

  getWeekLabel(): string {
    const start = this.calendarDays[0]?.date;
    const end = this.calendarDays[6]?.date;

    if (!start || !end) return '';

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${this.monthNames[start.getMonth()]}`;
    } else {
      return `${start.getDate()} ${this.monthNames[start.getMonth()]} - ${end.getDate()} ${this.monthNames[end.getMonth()]}`;
    }
  }

  canGoPrevious(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.currentWeekStart > today;
  }

  previousWeek(): void {
    if (!this.canGoPrevious()) return;

    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.generateCalendarDays();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.generateCalendarDays();
  }

  selectDay(day: CalendarDay): void {
    if (day.isPast) return;

    this.selectedDate = this.formatDateForApi(day.date);
    this.selectedCreneau = null;
    this.generateCalendarDays();
    this.loadCreneaux();
  }

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadCreneaux(): void {
    if (!this.medecin || !this.selectedDate) return;

    this.loadingSlots = true;
    this.selectedCreneau = null;

    this.medecinService.getCreneauxDisponibles(this.medecin.id, this.selectedDate).subscribe({
      next: (data) => {
        this.creneaux = data;
        this.loadingSlots = false;
      },
      error: () => {
        this.creneaux = [];
        this.loadingSlots = false;
      }
    });
  }

  selectCreneau(creneau: Creneau): void {
    if (creneau.disponible) {
      this.selectedCreneau = creneau;
    }
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return '';
    const date = new Date(this.selectedDate);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
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
      motif: this.selectedMotif,
      ...(this.selectedPatientId ? { patientId: this.selectedPatientId } : {})
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

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
