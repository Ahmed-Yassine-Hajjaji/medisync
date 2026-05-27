import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Prenez rendez-vous avec votre medecin en quelques clics</h1>
          <p>MediSync facilite la gestion de vos rendez-vous medicaux. Trouvez un praticien, consultez ses disponibilites et reservez instantanement.</p>
          <div class="hero-buttons">
            <a routerLink="/medecins" class="btn btn-primary btn-lg">Trouver un medecin</a>
            <a routerLink="/register" class="btn btn-secondary btn-lg">Creer un compte</a>
          </div>
        </div>
      </div>
    </div>

    <section class="features">
      <div class="container">
        <h2>Pourquoi choisir MediSync ?</h2>
        <div class="features-grid">
          <div class="feature-card card">
            <div class="feature-icon">📅</div>
            <h3>Reservation simple</h3>
            <p>Reservez vos rendez-vous en ligne 24h/24, 7j/7 selon les disponibilites reelles des praticiens.</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon">📋</div>
            <h3>Dossier medical</h3>
            <p>Accedez a votre historique medical, vos ordonnances et vos resultats d'analyses en un seul endroit.</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon">🔔</div>
            <h3>Rappels automatiques</h3>
            <p>Recevez des notifications par email pour ne jamais manquer un rendez-vous.</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon">🔒</div>
            <h3>Securise</h3>
            <p>Vos donnees de sante sont protegees et conformes aux normes RGPD.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, var(--primary) 0%, #1e40af 100%);
      color: white;
      padding: 4rem 0;
    }

    .hero-content {
      max-width: 600px;

      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 1rem;
      }

      p {
        font-size: 1.125rem;
        opacity: 0.9;
        margin-bottom: 2rem;
      }
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
    }

    .btn-lg {
      padding: 0.875rem 1.75rem;
      font-size: 1rem;
    }

    .features {
      padding: 4rem 0;

      h2 {
        text-align: center;
        font-size: 2rem;
        margin-bottom: 3rem;
      }
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

      .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }

      h3 {
        font-size: 1.125rem;
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--gray-500);
        font-size: 0.875rem;
      }
    }
  `]
})
export class HomeComponent {}
