import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hero">
      <div class="hero-bg"></div>
      <div class="container">
        <div class="hero-content animate-slideUp">
          <div class="hero-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            Plateforme medicale de confiance
          </div>
          <h1>Prenez rendez-vous avec votre medecin en quelques clics</h1>
          <p>MediSync facilite la gestion de vos rendez-vous medicaux au Maroc. Trouvez un praticien, consultez ses disponibilites et reservez instantanement.</p>
          <div class="hero-buttons">
            <a routerLink="/medecins" class="btn btn-primary btn-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              Trouver un medecin
            </a>
            <a routerLink="/register" class="btn btn-outline-white btn-lg">
              Creer un compte
            </a>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-value">50+</span>
              <span class="stat-label">Medecins</span>
            </div>
            <div class="stat">
              <span class="stat-value">1000+</span>
              <span class="stat-label">Patients</span>
            </div>
            <div class="stat">
              <span class="stat-value">5000+</span>
              <span class="stat-label">Consultations</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="features">
      <div class="container">
        <div class="section-header">
          <h2>Pourquoi choisir MediSync ?</h2>
          <p>Une solution complete pour gerer votre sante</p>
        </div>
        <div class="features-grid">
          <div class="feature-card card card-hover">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 2v4"/>
                <path d="M16 2v4"/>
                <rect width="18" height="18" x="3" y="4" rx="2"/>
                <path d="M3 10h18"/>
                <path d="M10 14h4"/>
                <path d="M12 12v4"/>
              </svg>
            </div>
            <h3>Reservation simple</h3>
            <p>Reservez vos rendez-vous en ligne 24h/24, 7j/7 selon les disponibilites reelles des praticiens.</p>
          </div>
          <div class="feature-card card card-hover">
            <div class="feature-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
                <path d="M10 9H8"/>
              </svg>
            </div>
            <h3>Dossier medical</h3>
            <p>Accedez a votre historique medical, vos ordonnances et vos resultats d'analyses en un seul endroit.</p>
          </div>
          <div class="feature-card card card-hover">
            <div class="feature-icon orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </div>
            <h3>Rappels automatiques</h3>
            <p>Recevez des notifications par email et SMS pour ne jamais manquer un rendez-vous.</p>
          </div>
          <div class="feature-card card card-hover">
            <div class="feature-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3>100% Securise</h3>
            <p>Vos donnees de sante sont protegees et conformes aux normes de securite les plus strictes.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cities-section">
      <div class="container">
        <div class="section-header">
          <h2>Disponible dans les grandes villes du Maroc</h2>
          <p>Trouvez des praticiens pres de chez vous</p>
        </div>
        <div class="cities-grid">
          <a routerLink="/medecins" [queryParams]="{ville: 'Casablanca'}" class="city-card">
            <span class="city-name">Casablanca</span>
            <span class="city-count">25 medecins</span>
          </a>
          <a routerLink="/medecins" [queryParams]="{ville: 'Rabat'}" class="city-card">
            <span class="city-name">Rabat</span>
            <span class="city-count">18 medecins</span>
          </a>
          <a routerLink="/medecins" [queryParams]="{ville: 'Marrakech'}" class="city-card">
            <span class="city-name">Marrakech</span>
            <span class="city-count">15 medecins</span>
          </a>
          <a routerLink="/medecins" [queryParams]="{ville: 'Fes'}" class="city-card">
            <span class="city-name">Fes</span>
            <span class="city-count">12 medecins</span>
          </a>
          <a routerLink="/medecins" [queryParams]="{ville: 'Tanger'}" class="city-card">
            <span class="city-name">Tanger</span>
            <span class="city-count">10 medecins</span>
          </a>
          <a routerLink="/medecins" [queryParams]="{ville: 'Agadir'}" class="city-card">
            <span class="city-name">Agadir</span>
            <span class="city-count">8 medecins</span>
          </a>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Pret a prendre soin de votre sante ?</h2>
          <p>Rejoignez des milliers de patients qui font confiance a MediSync</p>
          <a routerLink="/register" class="btn btn-primary btn-lg">
            Commencer gratuitement
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      background: linear-gradient(135deg, #1E6FD9 0%, #1550A8 100%);
      color: white;
      padding: 5rem 0;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.5;
    }

    .hero-content {
      max-width: 700px;
      position: relative;
      z-index: 1;

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(255,255,255,0.15);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-full);
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
      }

      h1 {
        font-size: 3rem;
        font-weight: 700;
        line-height: 1.15;
        margin-bottom: 1.25rem;
        color: white;
      }

      p {
        font-size: 1.125rem;
        opacity: 0.9;
        margin-bottom: 2rem;
        line-height: 1.7;
      }
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 3rem;

      .btn-outline-white {
        background: transparent;
        color: white;
        border: 2px solid rgba(255,255,255,0.5);

        &:hover {
          background: rgba(255,255,255,0.1);
          border-color: white;
        }
      }
    }

    .hero-stats {
      display: flex;
      gap: 3rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255,255,255,0.2);

      .stat {
        text-align: center;

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.8;
        }
      }
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;

      h2 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--gray-500);
        font-size: 1.0625rem;
      }
    }

    .features {
      padding: 5rem 0;
      background: var(--white);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .feature-card {
      text-align: center;
      padding: 2rem;

      .feature-icon {
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-light);
        color: var(--primary);
        border-radius: var(--radius-lg);
        margin: 0 auto 1.25rem;

        &.green {
          background: #D1FAE5;
          color: #059669;
        }

        &.orange {
          background: #FEF3C7;
          color: #D97706;
        }

        &.purple {
          background: #EDE9FE;
          color: #7C3AED;
        }
      }

      h3 {
        font-size: 1.125rem;
        margin-bottom: 0.75rem;
      }

      p {
        color: var(--gray-500);
        font-size: 0.9375rem;
        line-height: 1.6;
      }
    }

    .cities-section {
      padding: 5rem 0;
      background: var(--gray-50);
    }

    .cities-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1rem;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (max-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .city-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      text-decoration: none;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);

        .city-name {
          color: var(--primary);
        }
      }

      .city-name {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: 0.25rem;
      }

      .city-count {
        font-size: 0.8125rem;
        color: var(--gray-500);
      }
    }

    .cta-section {
      padding: 5rem 0;
      background: linear-gradient(135deg, #1E6FD9 0%, #1550A8 100%);
    }

    .cta-content {
      text-align: center;
      color: white;

      h2 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        color: white;
      }

      p {
        font-size: 1.125rem;
        opacity: 0.9;
        margin-bottom: 2rem;
      }

      .btn-primary {
        background: white;
        color: var(--primary);

        &:hover {
          background: var(--gray-100);
        }
      }
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }

      .hero-buttons {
        flex-direction: column;
      }

      .hero-stats {
        gap: 1.5rem;
      }
    }
  `]
})
export class HomeComponent {}
