import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-glow"></div>
      <div class="container hero-grid">
        <!-- Left Column -->
        <div class="hero-text">
          <div class="hero-pill">&#10022; Plateforme N&deg;1 au Maroc</div>
          <h1>Prenez rendez-vous avec votre m&eacute;decin en quelques clics</h1>
          <p class="hero-subtitle">MediSync facilite la gestion de vos rendez-vous m&eacute;dicaux au Maroc. Trouvez un praticien, consultez ses disponibilit&eacute;s et r&eacute;servez instantan&eacute;ment.</p>
          <div class="hero-buttons">
            <a routerLink="/medecins" class="btn-cta-primary">Trouver un m&eacute;decin &rarr;</a>
            <a routerLink="/register" class="btn-cta-secondary">Cr&eacute;er un compte</a>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-value">50+</span>
              <span class="stat-label">M&eacute;decins</span>
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

        <!-- Right Column -->
        <div class="hero-visual">
          <div class="deco-circle deco-circle-1"></div>
          <div class="deco-circle deco-circle-2"></div>
          <div class="mockup-card">
            <div class="mockup-header">
              <div class="mockup-avatar">Dr</div>
              <div class="mockup-info">
                <span class="mockup-name">Dr. Benali Karim</span>
                <span class="mockup-badge">G&eacute;n&eacute;raliste</span>
              </div>
            </div>
            <div class="mockup-divider"></div>
            <span class="mockup-label">Prochains cr&eacute;neaux disponibles</span>
            <div class="mockup-slots">
              <button class="slot">09:00</button>
              <button class="slot selected">10:30</button>
              <button class="slot">14:00</button>
            </div>
            <button class="mockup-confirm">Confirmer le rendez-vous</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="section-header">
          <h2>Pourquoi choisir MediSync ?</h2>
          <p>Une solution compl&egrave;te pour g&eacute;rer votre sant&eacute;</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 2v4"/><path d="M16 2v4"/>
                <rect width="18" height="18" x="3" y="4" rx="2"/>
                <path d="M3 10h18"/><path d="M10 14h4"/><path d="M12 12v4"/>
              </svg>
            </div>
            <h3>R&eacute;servation simple</h3>
            <p>R&eacute;servez vos rendez-vous en ligne 24h/24, 7j/7 selon les disponibilit&eacute;s r&eacute;elles.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
              </svg>
            </div>
            <h3>Dossier m&eacute;dical</h3>
            <p>Acc&eacute;dez &agrave; votre historique, ordonnances et r&eacute;sultats d'analyses en un seul endroit.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </div>
            <h3>Rappels automatiques</h3>
            <p>Ne manquez jamais un rendez-vous gr&acirc;ce aux notifications email et SMS.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3>100% S&eacute;curis&eacute;</h3>
            <p>Vos donn&eacute;es de sant&eacute; prot&eacute;g&eacute;es selon les normes de s&eacute;curit&eacute; les plus strictes.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Cities Section -->
    <section class="cities">
      <div class="container">
        <div class="section-header">
          <h2>Disponible dans les grandes villes</h2>
          <p>Trouvez des praticiens pr&egrave;s de chez vous</p>
        </div>
        <div class="cities-grid">
          <a routerLink="/medecins" [queryParams]="{ville: 'Casablanca'}" class="city-card">
            <span class="city-left">&#127751; <span class="city-name">Casablanca</span></span>
            <span class="city-right">
              <span class="city-count">25 m&eacute;decins</span>
              <span class="city-arrow">&rarr;</span>
            </span>
          </a>
          <a routerLink="/medecins" [queryParams]="{ville: 'Rabat'}" class="city-card">
            <span class="city-left">&#127963; <span class="city-name">Rabat</span></span>
            <span class="city-right">
              <span class="city-count">18 m&eacute;decins</span>
              <span class="city-arrow">&rarr;</span>
            </span>
          </a>
          <a routerLink="/medecins" [queryParams]="{ville: 'Marrakech'}" class="city-card">
            <span class="city-left">&#127796; <span class="city-name">Marrakech</span></span>
            <span class="city-right">
              <span class="city-count">15 m&eacute;decins</span>
              <span class="city-arrow">&rarr;</span>
            </span>
          </a>
          <a routerLink="/medecins" [queryParams]="{ville: 'Fes'}" class="city-card">
            <span class="city-left">&#128332; <span class="city-name">F&egrave;s</span></span>
            <span class="city-right">
              <span class="city-count">12 m&eacute;decins</span>
              <span class="city-arrow">&rarr;</span>
            </span>
          </a>
          <a routerLink="/medecins" [queryParams]="{ville: 'Tanger'}" class="city-card">
            <span class="city-left">&#127754; <span class="city-name">Tanger</span></span>
            <span class="city-right">
              <span class="city-count">10 m&eacute;decins</span>
              <span class="city-arrow">&rarr;</span>
            </span>
          </a>
          <a routerLink="/medecins" [queryParams]="{ville: 'Agadir'}" class="city-card">
            <span class="city-left">&#127958; <span class="city-name">Agadir</span></span>
            <span class="city-right">
              <span class="city-count">8 m&eacute;decins</span>
              <span class="city-arrow">&rarr;</span>
            </span>
          </a>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container cta-content">
        <h2>Pr&ecirc;t &agrave; prendre soin de votre sant&eacute; ?</h2>
        <p>Rejoignez des milliers de patients qui font confiance &agrave; MediSync</p>
        <a routerLink="/register" class="btn-cta-white">Commencer gratuitement &rarr;</a>
        <div class="trust-badges">
          <span class="trust-badge">&#128274; Donn&eacute;es s&eacute;curis&eacute;es</span>
          <span class="trust-badge">&#10003; Gratuit pour les patients</span>
          <span class="trust-badge">&#128241; Application mobile</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    :host {
      display: block;
      font-family: 'Inter', sans-serif;
      scroll-behavior: smooth;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* ==================== HERO ==================== */
    .hero {
      position: relative;
      background: linear-gradient(135deg, #0f4fa8 0%, #1E6FD9 50%, #3b8ff5 100%);
      color: #fff;
      padding: 5rem 0;
      overflow: hidden;
    }

    .hero-glow {
      position: absolute;
      top: -20%;
      right: -10%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 70%);
      pointer-events: none;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .hero-pill {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
    }

    .hero-text h1 {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      color: #fff;
      margin-bottom: 1.25rem;
    }

    .hero-subtitle {
      color: rgba(255,255,255,0.85);
      font-size: 1.125rem;
      line-height: 1.7;
      margin-bottom: 2rem;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-cta-primary {
      display: inline-block;
      background: #fff;
      color: #1E6FD9;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      border: none;
      border-radius: 12px;
      padding: 14px 28px;
      font-size: 1rem;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      transition: all 0.25s ease;
      cursor: pointer;
    }

    .btn-cta-primary:hover {
      transform: scale(1.02);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }

    .btn-cta-secondary {
      display: inline-block;
      background: transparent;
      color: #fff;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      border: 2px solid rgba(255,255,255,0.5);
      border-radius: 12px;
      padding: 14px 28px;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.25s ease;
      cursor: pointer;
    }

    .btn-cta-secondary:hover {
      border-color: #fff;
    }

    .hero-stats {
      display: flex;
      gap: 0;
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 2rem;
      margin-top: 2.5rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 2rem;
      border-right: 1px solid rgba(255,255,255,0.2);
    }

    .stat:first-child {
      padding-left: 0;
    }

    .stat:last-child {
      border-right: none;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
    }

    .stat-label {
      font-size: 0.8rem;
      opacity: 0.75;
      margin-top: 0.25rem;
    }

    /* ==================== HERO VISUAL ==================== */
    .hero-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .deco-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
    }

    .deco-circle-1 {
      width: 300px;
      height: 300px;
      top: -30px;
      right: -40px;
      filter: blur(40px);
    }

    .deco-circle-2 {
      width: 200px;
      height: 200px;
      bottom: -20px;
      left: -20px;
      filter: blur(30px);
    }

    .mockup-card {
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.25);
      padding: 32px;
      width: 340px;
      position: relative;
      z-index: 2;
      animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .mockup-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .mockup-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #1E6FD9;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      font-family: 'Inter', sans-serif;
    }

    .mockup-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .mockup-name {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      font-family: 'Inter', sans-serif;
    }

    .mockup-badge {
      display: inline-block;
      background: #EAF2FD;
      color: #1E6FD9;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 999px;
      width: fit-content;
      font-family: 'Inter', sans-serif;
    }

    .mockup-divider {
      height: 1px;
      background: #f1f5f9;
      margin: 20px 0;
    }

    .mockup-label {
      font-size: 0.8125rem;
      color: #64748b;
      font-weight: 500;
      display: block;
      margin-bottom: 12px;
      font-family: 'Inter', sans-serif;
    }

    .mockup-slots {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }

    .slot {
      background: #EAF2FD;
      color: #1E6FD9;
      border: none;
      border-radius: 10px;
      padding: 10px 0;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: all 0.25s ease;
    }

    .slot.selected {
      background: #1E6FD9;
      color: #fff;
    }

    .mockup-confirm {
      width: 100%;
      background: #10b981;
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 12px 0;
      font-weight: 700;
      font-size: 0.9375rem;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: all 0.25s ease;
    }

    .mockup-confirm:hover {
      background: #059669;
    }

    /* ==================== FEATURES ==================== */
    .features {
      background: #F8FAFC;
      padding: 6rem 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }

    .section-header p {
      color: #64748b;
      font-size: 1.0625rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .feature-card {
      background: #fff;
      border: 1px solid #f1f5f9;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      border-radius: 16px;
      padding: 2.25rem;
      transition: all 0.25s ease;
    }

    .feature-card:hover {
      box-shadow: 0 12px 40px rgba(30,111,217,0.12);
      transform: translateY(-4px);
    }

    .feature-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #EAF2FD;
      color: #1E6FD9;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .feature-card h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
      margin-top: 1.25rem;
      margin-bottom: 0.75rem;
    }

    .feature-card p {
      font-size: 0.9375rem;
      color: #64748b;
      line-height: 1.65;
    }

    /* ==================== CITIES ==================== */
    .cities {
      background: #fff;
      padding: 5rem 0;
    }

    .cities-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    .city-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.75rem 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      text-decoration: none;
      transition: all 0.25s ease;
      cursor: pointer;
    }

    .city-card:hover {
      border-color: #1E6FD9;
      box-shadow: 0 8px 30px rgba(30,111,217,0.12);
      transform: translateY(-2px);
    }

    .city-card:hover .city-arrow {
      opacity: 1;
    }

    .city-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .city-name {
      font-size: 1.0625rem;
      font-weight: 700;
      color: #0f172a;
    }

    .city-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .city-count {
      background: #EAF2FD;
      color: #1E6FD9;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 999px;
    }

    .city-arrow {
      color: #94a3b8;
      font-size: 1rem;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    /* ==================== CTA ==================== */
    .cta {
      background: linear-gradient(315deg, #0f4fa8 0%, #1E6FD9 50%, #3b8ff5 100%);
      padding: 5rem 0;
    }

    .cta-content {
      text-align: center;
      color: #fff;
    }

    .cta-content h2 {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 0.75rem;
    }

    .cta-content p {
      font-size: 1.125rem;
      color: rgba(255,255,255,0.85);
      margin-bottom: 2rem;
    }

    .btn-cta-white {
      display: inline-block;
      background: #fff;
      color: #1E6FD9;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      border: none;
      border-radius: 12px;
      padding: 16px 32px;
      font-size: 1.0625rem;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      transition: all 0.25s ease;
      cursor: pointer;
    }

    .btn-cta-white:hover {
      transform: scale(1.02);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }

    .trust-badges {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 2.5rem;
      flex-wrap: wrap;
    }

    .trust-badge {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.8);
      font-weight: 500;
    }

    /* ==================== RESPONSIVE ==================== */
    @media (max-width: 1024px) {
      .hero-grid {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-text h1 {
        font-size: 2.5rem;
      }

      .hero-buttons {
        justify-content: center;
      }

      .hero-stats {
        justify-content: center;
      }

      .hero-visual {
        display: none;
      }

      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .cities-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .hero {
        padding: 3.5rem 0;
      }

      .hero-text h1 {
        font-size: 2.2rem;
      }

      .hero-buttons {
        flex-direction: column;
        align-items: center;
      }

      .hero-stats {
        flex-direction: column;
        gap: 1.25rem;
        align-items: center;
      }

      .stat {
        border-right: none !important;
        padding: 0;
      }

      .features {
        padding: 4rem 0;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .cities-grid {
        grid-template-columns: 1fr;
      }

      .section-header h2 {
        font-size: 1.75rem;
      }

      .trust-badges {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
    }
  `]
})
export class HomeComponent {}
