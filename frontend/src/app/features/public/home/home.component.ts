import { Component, signal, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- ==================== HERO ==================== -->
    <section class="hero">
      <div class="hero-glow"></div>
      <div class="container hero-grid">
        <div class="hero-text" [class.visible]="heroVisible()">
          <div class="hero-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>
            Plateforme N&deg;1 au Maroc
          </div>
          <h1>Des soins innovants pour une <span class="accent">meilleure sant&eacute;</span></h1>
          <p class="hero-subtitle">MediSync r&eacute;invente la gestion de vos rendez-vous m&eacute;dicaux. Trouvez un praticien, consultez ses disponibilit&eacute;s et r&eacute;servez instantan&eacute;ment.</p>
          <div class="hero-buttons">
            <a routerLink="/medecins" class="btn-cta-primary">
              Trouver un m&eacute;decin
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <a routerLink="/register" class="btn-cta-secondary">Cr&eacute;er un compte</a>
          </div>
          <div class="hero-badges">
            <div class="hero-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>
              <span>Soins experts</span>
            </div>
            <div class="hero-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
              <span>Disponible 24/7</span>
            </div>
            <div class="hero-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
              <span>Professionnels certifi&eacute;s</span>
            </div>
          </div>
        </div>

        <!-- Hero Image -->
        <div class="hero-visual" [class.visible]="heroVisible()">
          <div class="hero-blur-circle"></div>
          <div class="hero-image-wrap">
            <div class="hero-image-container">
              <img src="assets/images/doctor1.png" alt="Professionnel de sant&eacute;" class="hero-image" />
            </div>
            <div class="hero-image-overlay">
              <h3>&Eacute;quipe m&eacute;dicale d'excellence</h3>
              <p>D&eacute;vou&eacute;e &agrave; fournir les meilleurs soins possibles</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SERVICES ==================== -->
    <section class="services" #servicesRef>
      <div class="container">
        <div class="section-header">
          <div class="section-pill">Nos sp&eacute;cialit&eacute;s</div>
          <h2>Des soins m&eacute;dicaux complets</h2>
          <p>Nous proposons une large gamme de services m&eacute;dicaux pour r&eacute;pondre &agrave; tous vos besoins de sant&eacute;.</p>
        </div>
        <div class="services-grid">
          @for (service of services; track service.title; let i = $index) {
            <div class="service-card" [class.visible]="servicesVisible()" [style.animation-delay]="(i * 80) + 'ms'">
              <div class="service-icon" [style.color]="service.color" [style.background]="service.bgColor">
                <div [innerHTML]="trustHtml(service.svg)"></div>
              </div>
              <h3>{{ service.title }}</h3>
              <p>{{ service.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ==================== DOCTORS ==================== -->
    <section class="doctors" #doctorsRef>
      <div class="container">
        <div class="section-header">
          <div class="section-pill">&Eacute;quipe m&eacute;dicale</div>
          <h2>Nos m&eacute;decins experts</h2>
          <p>Une &eacute;quipe de professionnels de sant&eacute; hautement qualifi&eacute;s, d&eacute;di&eacute;e &agrave; votre bien-&ecirc;tre.</p>
        </div>
        <div class="doctors-grid">
          @for (doctor of doctors; track doctor.name; let i = $index) {
            <div class="doctor-card" [class.visible]="doctorsVisible()" [style.animation-delay]="(i * 150) + 'ms'">
              <div class="doctor-image-wrap">
                <img [src]="doctor.image" [alt]="doctor.name" class="doctor-image" />
              </div>
              <div class="doctor-info">
                <h3>{{ doctor.name }}</h3>
                <span class="doctor-specialty">{{ doctor.specialty }}</span>
                <p class="doctor-desc">{{ doctor.description }}</p>
              </div>
              <div class="doctor-actions">
                <a routerLink="/medecins" class="btn-outline-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                  Prendre RDV
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ==================== APPOINTMENT ==================== -->
    <section class="appointment" #appointmentRef>
      <div class="container appointment-grid">
        <div class="appointment-left" [class.visible]="appointmentVisible()">
          <div class="section-pill">R&eacute;server maintenant</div>
          <h2>Planifiez votre rendez-vous</h2>
          <p class="appointment-subtitle">Faites le premier pas vers une meilleure sant&eacute;. Prenez rendez-vous avec notre &eacute;quipe m&eacute;dicale d&egrave;s aujourd'hui.</p>
          <div class="appointment-features">
            <div class="appt-feature">
              <div class="appt-check">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div>
                <h4>R&eacute;servation en ligne facile</h4>
                <p>Prenez rendez-vous o&ugrave; que vous soyez, &agrave; tout moment</p>
              </div>
            </div>
            <div class="appt-feature">
              <div class="appt-check">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div>
                <h4>Personnel m&eacute;dical expert</h4>
                <p>Des sp&eacute;cialistes certifi&eacute;s &agrave; votre &eacute;coute</p>
              </div>
            </div>
            <div class="appt-feature">
              <div class="appt-check">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div>
                <h4>Horaires flexibles</h4>
                <p>Cr&eacute;neaux matin, apr&egrave;s-midi et soir disponibles</p>
              </div>
            </div>
          </div>
        </div>
        <div class="appointment-right" [class.visible]="appointmentVisible()">
          <div class="mockup-card">
            <div class="mockup-header">
              <div class="mockup-avatar">Dr</div>
              <div class="mockup-info">
                <span class="mockup-name">Dr. Benali Karim</span>
                <span class="mockup-badge">G&eacute;n&eacute;raliste &bull; 150 DH</span>
              </div>
            </div>
            <div class="mockup-divider"></div>
            <span class="mockup-label">Prochains cr&eacute;neaux disponibles</span>
            <div class="mockup-slots">
              <button class="slot">09:00</button>
              <button class="slot selected">10:30</button>
              <button class="slot">14:00</button>
              <button class="slot">15:30</button>
              <button class="slot">16:00</button>
              <button class="slot">17:30</button>
            </div>
            <button class="mockup-confirm" routerLink="/medecins">Confirmer le rendez-vous</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== CITIES ==================== -->
    <section class="cities" #citiesRef>
      <div class="container">
        <div class="section-header">
          <div class="section-pill">Couverture nationale</div>
          <h2>Disponible dans les grandes villes</h2>
          <p>Trouvez des praticiens pr&egrave;s de chez vous</p>
        </div>
        <div class="cities-grid">
          @for (city of cities; track city.name; let i = $index) {
            <a routerLink="/medecins" [queryParams]="{ville: city.name}" class="city-card" [class.visible]="citiesVisible()" [style.animation-delay]="(i * 80) + 'ms'">
              <span class="city-left">
                <span class="city-icon" [innerHTML]="trustHtml(city.icon)"></span>
                <span class="city-name">{{ city.name }}</span>
              </span>
              <span class="city-right">
                <span class="city-count">{{ city.count }} m&eacute;decins</span>
                <svg class="city-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- ==================== CTA ==================== -->
    <section class="cta">
      <div class="container cta-content">
        <h2>Pr&ecirc;t &agrave; prendre soin de votre sant&eacute; ?</h2>
        <p>Rejoignez des milliers de patients qui font confiance &agrave; MediSync</p>
        <a routerLink="/register" class="btn-cta-white">
          Commencer gratuitement
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
        <div class="trust-badges">
          <span class="trust-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Donn&eacute;es s&eacute;curis&eacute;es
          </span>
          <span class="trust-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            Gratuit pour les patients
          </span>
          <span class="trust-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            Application mobile
          </span>
        </div>
      </div>
    </section>

    <!-- ==================== FOOTER ==================== -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <div class="footer-logo-icon">
                <svg viewBox="0 0 24 24" fill="none" class="logo-svg">
                  <path d="M2 12H5.5L7.5 8L10.5 16L12.5 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 12H18L20 8L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="footer-brand-name">MediSync</span>
            </div>
            <p class="footer-desc">Solutions innovantes de gestion m&eacute;dicale, centr&eacute;es sur le confort du patient et la technologie de pointe.</p>
            <div class="footer-socials">
              <a href="#" class="social-link" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" class="social-link" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" class="social-link" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Liens rapides</h4>
            <ul>
              <li><a routerLink="/">Accueil</a></li>
              <li><a routerLink="/medecins">Nos m&eacute;decins</a></li>
              <li><a routerLink="/register">S'inscrire</a></li>
              <li><a routerLink="/login">Se connecter</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Sp&eacute;cialit&eacute;s</h4>
            <ul>
              <li><a routerLink="/medecins">M&eacute;decine g&eacute;n&eacute;rale</a></li>
              <li><a routerLink="/medecins">Cardiologie</a></li>
              <li><a routerLink="/medecins">Dermatologie</a></li>
              <li><a routerLink="/medecins">P&eacute;diatrie</a></li>
              <li><a routerLink="/medecins">Chirurgie</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Contact</h4>
            <ul class="contact-list">
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                45 Bd Zerktouni, Maarif, Casablanca
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                0522-123-456
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                contact&#64;medisync.ma
              </li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 MediSync. Tous droits r&eacute;serv&eacute;s.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    :host {
      display: block;
      font-family: 'Inter', sans-serif;
      --primary: #1E6FD9;
      --primary-dark: #0f4fa8;
      --primary-light: #3b8ff5;
      --primary-bg: #EAF2FD;
      --primary-bg-hover: #d4e4f9;
      --text-dark: #0f172a;
      --text-body: #475569;
      --text-muted: #64748b;
      --bg-light: #F8FAFC;
      --border: #e2e8f0;
      --radius: 16px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .section-header h2 {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-dark);
      margin-bottom: 0.75rem;
    }
    .section-header p {
      color: var(--text-muted);
      font-size: 1.0625rem;
      max-width: 600px;
      margin: 0 auto;
    }
    .section-pill {
      display: inline-block;
      background: var(--primary-bg);
      color: var(--primary);
      font-size: 0.8125rem;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 999px;
      margin-bottom: 1rem;
    }

    /* ==================== ANIMATIONS ==================== */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* ==================== HERO ==================== */
    .hero {
      position: relative;
      background: #f8fafc;
      color: var(--text-dark);
      padding: 5rem 0 6rem;
      overflow: hidden;
    }
    .hero-glow {
      position: absolute;
      top: -20%;
      right: -10%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%);
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

    .hero-text {
      opacity: 0;
      &.visible { animation: slideInLeft 0.8s ease forwards; }
    }

    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary-bg);
      border: 1px solid var(--primary-bg-hover);
      color: var(--primary);
      border-radius: 999px;
      padding: 7px 18px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1.75rem;
      svg { opacity: 0.9; color: var(--primary); }
    }

    .hero-text h1 {
      font-size: 3.25rem;
      font-weight: 800;
      line-height: 1.12;
      margin-bottom: 1.25rem;
      color: var(--text-dark);
      .accent { color: var(--primary); }
    }

    .hero-subtitle {
      color: var(--text-muted);
      font-size: 1.0625rem;
      line-height: 1.75;
      margin-bottom: 2rem;
      max-width: 520px;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .btn-cta-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary);
      color: #fff;
      font-weight: 700;
      border: none;
      border-radius: 12px;
      padding: 14px 28px;
      font-size: 0.9375rem;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(37,99,235,0.3);
      transition: all 0.25s ease;
      cursor: pointer;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.4); background: var(--primary-dark); }
    }
    .btn-cta-secondary {
      display: inline-flex;
      align-items: center;
      background: transparent;
      color: var(--text-dark);
      font-weight: 600;
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 14px 28px;
      font-size: 0.9375rem;
      text-decoration: none;
      transition: all 0.25s ease;
      cursor: pointer;
      &:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-bg); }
    }

    .hero-badges {
      display: flex;
      gap: 1.5rem;
      margin-top: 2.5rem;
      flex-wrap: wrap;
    }
    .hero-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      color: var(--text-muted);
      svg { color: var(--primary); }
    }

    /* Hero Visual */
    .hero-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      &.visible { animation: scaleIn 0.8s ease 0.3s forwards; }
    }
    .hero-blur-circle {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(37,99,235,0.06), rgba(147,197,253,0.08));
      filter: blur(60px);
      top: -10%;
      right: -10%;
    }
    .hero-image-wrap {
      position: relative;
      z-index: 2;
      overflow: hidden;
      border-radius: 20px;
      border: 1px solid var(--border);
      box-shadow: 0 25px 60px rgba(0,0,0,0.1);
      max-width: 420px;
      width: 100%;
    }
    .hero-image-container {
      aspect-ratio: 1;
      overflow: hidden;
    }
    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
      &:hover { transform: scale(1.05); }
    }
    .hero-image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
      padding: 2rem 1.5rem 1.5rem;
      h3 { font-size: 1.125rem; font-weight: 700; color: #fff; }
      p { font-size: 0.8125rem; opacity: 0.85; margin-top: 4px; color: #fff; }
    }

    /* ==================== SERVICES ==================== */
    .services {
      background: #fff;
      padding: 6rem 0;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
    .service-card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
      transition: all 0.3s ease;
      opacity: 0;
      &.visible { animation: fadeInUp 0.5s ease forwards; }
      &:hover {
        box-shadow: 0 12px 40px rgba(30,111,217,0.1);
        transform: translateY(-4px);
        border-color: var(--primary-bg);
      }
      h3 { font-size: 1.0625rem; font-weight: 700; color: var(--text-dark); margin-top: 1.25rem; margin-bottom: 0.5rem; }
      p { font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; }
    }
    .service-icon {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ==================== DOCTORS ==================== */
    .doctors {
      background: var(--bg-light);
      padding: 6rem 0;
    }
    .doctors-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
    .doctor-card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: all 0.3s ease;
      opacity: 0;
      &.visible { animation: fadeInUp 0.5s ease forwards; }
      &:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.1); }
    }
    .doctor-image-wrap {
      aspect-ratio: 4/3;
      overflow: hidden;
    }
    .doctor-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
      .doctor-card:hover & { transform: scale(1.05); }
    }
    .doctor-info {
      padding: 1.5rem;
      h3 { font-size: 1.125rem; font-weight: 700; color: var(--text-dark); }
      .doctor-specialty {
        display: inline-block;
        color: var(--primary);
        font-size: 0.8125rem;
        font-weight: 600;
        margin-top: 4px;
      }
      .doctor-desc {
        font-size: 0.875rem;
        color: var(--text-muted);
        line-height: 1.6;
        margin-top: 0.75rem;
      }
    }
    .doctor-actions {
      padding: 0 1.5rem 1.5rem;
    }
    .btn-outline-sm {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1.5px solid var(--primary-bg-hover);
      color: var(--primary);
      font-weight: 600;
      font-size: 0.8125rem;
      padding: 8px 16px;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s ease;
      &:hover { background: var(--primary-bg); border-color: var(--primary); }
    }

    /* ==================== APPOINTMENT ==================== */
    .appointment {
      background: #fff;
      padding: 6rem 0;
    }
    .appointment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: start;
    }
    .appointment-left {
      opacity: 0;
      &.visible { animation: slideInLeft 0.7s ease forwards; }
      h2 {
        font-size: 2.25rem;
        font-weight: 800;
        color: var(--text-dark);
        margin-bottom: 1rem;
      }
      .appointment-subtitle {
        color: var(--text-muted);
        font-size: 1.0625rem;
        line-height: 1.7;
        margin-bottom: 2rem;
        max-width: 480px;
      }
    }
    .appointment-features {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .appt-feature {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      h4 { font-size: 0.9375rem; font-weight: 600; color: var(--text-dark); }
      p { font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px; }
    }
    .appt-check {
      flex-shrink: 0;
      background: var(--primary-bg);
      border-radius: 50%;
      padding: 8px;
      margin-top: 2px;
      svg { color: var(--primary); }
    }
    .appointment-right {
      opacity: 0;
      &.visible { animation: scaleIn 0.7s ease 0.2s forwards; }
    }

    /* Mockup Card */
    .mockup-card {
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.12);
      border: 1px solid var(--border);
      padding: 2rem;
      animation: float 5s ease-in-out infinite;
    }
    .mockup-header { display: flex; align-items: center; gap: 12px; }
    .mockup-avatar {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--primary); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.875rem;
    }
    .mockup-info { display: flex; flex-direction: column; gap: 4px; }
    .mockup-name { font-size: 1rem; font-weight: 700; color: var(--text-dark); }
    .mockup-badge {
      display: inline-block;
      background: var(--primary-bg); color: var(--primary);
      font-size: 0.75rem; font-weight: 600;
      padding: 3px 10px; border-radius: 999px;
      width: fit-content;
    }
    .mockup-divider { height: 1px; background: #f1f5f9; margin: 20px 0; }
    .mockup-label {
      font-size: 0.8125rem; color: var(--text-muted);
      font-weight: 500; display: block; margin-bottom: 12px;
    }
    .mockup-slots {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 8px; margin-bottom: 16px;
    }
    .slot {
      background: var(--primary-bg); color: var(--primary);
      border: none; border-radius: 10px;
      padding: 10px 0; font-weight: 600; font-size: 0.875rem;
      cursor: pointer; font-family: inherit;
      transition: all 0.2s ease;
      &.selected { background: var(--primary); color: #fff; }
      &:hover:not(.selected) { background: var(--primary-bg-hover); }
    }
    .mockup-confirm {
      width: 100%;
      background: #10b981; color: #fff;
      border: none; border-radius: 12px;
      padding: 13px 0; font-weight: 700;
      font-size: 0.9375rem; cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      text-decoration: none;
      display: block;
      text-align: center;
      &:hover { background: #059669; }
    }

    /* ==================== CITIES ==================== */
    .cities {
      background: var(--bg-light);
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
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      text-decoration: none;
      transition: all 0.25s ease;
      cursor: pointer;
      opacity: 0;
      &.visible { animation: fadeInUp 0.5s ease forwards; }
      &:hover {
        border-color: var(--primary);
        box-shadow: 0 8px 30px rgba(30,111,217,0.1);
        transform: translateY(-2px);
        .city-arrow { opacity: 1; transform: translateX(0); }
      }
    }
    .city-left { display: flex; align-items: center; gap: 0.75rem; }
    .city-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }
    .city-name { font-size: 1rem; font-weight: 700; color: var(--text-dark); }
    .city-right { display: flex; align-items: center; gap: 0.75rem; }
    .city-count {
      background: var(--primary-bg); color: var(--primary);
      font-size: 0.8rem; font-weight: 600;
      padding: 4px 12px; border-radius: 999px;
    }
    .city-arrow {
      color: var(--primary);
      opacity: 0;
      transform: translateX(-4px);
      transition: all 0.25s ease;
    }

    /* ==================== CTA ==================== */
    .cta {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-light) 100%);
      padding: 5rem 0;
    }
    .cta-content { text-align: center; color: #fff; }
    .cta-content h2 {
      font-size: 2.25rem; font-weight: 800;
      margin-bottom: 0.75rem;
    }
    .cta-content > p {
      font-size: 1.125rem; color: rgba(255,255,255,0.85);
      margin-bottom: 2rem;
    }
    .btn-cta-white {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      color: var(--primary);
      font-weight: 700;
      border: none;
      border-radius: 12px;
      padding: 16px 32px;
      font-size: 1rem;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      transition: all 0.25s ease;
      cursor: pointer;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
    }
    .trust-badges {
      display: flex;
      justify-content: center;
      gap: 2.5rem;
      margin-top: 2.5rem;
      flex-wrap: wrap;
    }
    .trust-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: rgba(255,255,255,0.85);
      font-weight: 500;
      svg { opacity: 0.8; }
    }

    /* ==================== FOOTER ==================== */
    .footer {
      background: #0f172a;
      color: #94a3b8;
      padding: 4rem 0 0;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
      gap: 3rem;
    }
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 1rem;
    }
    .footer-logo-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-svg { width: 22px; height: 22px; color: #fff; }
    .footer-brand-name { font-size: 1.25rem; font-weight: 800; color: #fff; }
    .footer-desc { font-size: 0.875rem; line-height: 1.7; margin-bottom: 1.25rem; }
    .footer-socials { display: flex; gap: 12px; }
    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(255,255,255,0.08);
      color: #94a3b8;
      transition: all 0.2s ease;
      &:hover { background: var(--primary); color: #fff; }
    }
    .footer-col {
      h4 {
        font-size: 0.9375rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 1.25rem;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      li {
        margin-bottom: 0.75rem;
      }
      a {
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.2s ease;
        &:hover { color: #93c5fd; }
      }
    }
    .contact-list {
      li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 0.875rem;
        svg { flex-shrink: 0; color: var(--primary); margin-top: 2px; }
      }
    }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.08);
      margin-top: 3rem;
      padding: 1.5rem 0;
      text-align: center;
      font-size: 0.8125rem;
    }

    /* ==================== RESPONSIVE ==================== */
    @media (max-width: 1024px) {
      .hero-grid { grid-template-columns: 1fr; text-align: center; }
      .hero-subtitle { margin: 0 auto 2rem; }
      .hero-buttons { justify-content: center; }
      .hero-badges { justify-content: center; }
      .hero-visual { display: none; }
      .services-grid { grid-template-columns: repeat(2, 1fr); }
      .doctors-grid { grid-template-columns: repeat(2, 1fr); }

      .appointment-grid { grid-template-columns: 1fr; }
      .appointment-left { text-align: center; }
      .appointment-subtitle { margin: 0 auto 2rem !important; }
      .appointment-features { align-items: center; }
      .appt-feature { text-align: left; }
      .mockup-card { max-width: 400px; margin: 0 auto; }
      .cities-grid { grid-template-columns: repeat(2, 1fr); }
      .footer-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .hero { padding: 3.5rem 0 4rem; }
      .hero-text h1 { font-size: 2.25rem; }
      .hero-buttons { flex-direction: column; align-items: center; }
      .hero-badges { flex-direction: column; align-items: center; gap: 0.75rem; }
      .services-grid { grid-template-columns: 1fr; }
      .doctors-grid { grid-template-columns: 1fr; }

      .cities-grid { grid-template-columns: 1fr; }
      .section-header h2 { font-size: 1.75rem; }
      .cta-content h2 { font-size: 1.75rem; }
      .trust-badges { flex-direction: column; align-items: center; gap: 1rem; }
      .footer-grid { grid-template-columns: 1fr; }
      .appointment-left h2 { font-size: 1.75rem; }
    }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('servicesRef') servicesRef!: ElementRef;
  @ViewChild('doctorsRef') doctorsRef!: ElementRef;
  @ViewChild('appointmentRef') appointmentRef!: ElementRef;
  @ViewChild('citiesRef') citiesRef!: ElementRef;

  heroVisible = signal(false);
  servicesVisible = signal(false);
  doctorsVisible = signal(false);
  appointmentVisible = signal(false);
  citiesVisible = signal(false);

  constructor(private sanitizer: DomSanitizer) {}

  trustHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  services = [
    {
      title: 'Cardiologie',
      description: 'Soins cardiaques complets avec diagnostic et traitements de pointe.',
      color: '#2563eb',
      bgColor: 'transparent',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>'
    },
    {
      title: 'Dermatologie',
      description: 'Soins sp\u00e9cialis\u00e9s de la peau, dermatologie esth\u00e9tique et m\u00e9dicale.',
      color: '#2563eb',
      bgColor: 'transparent',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>'
    },
    {
      title: 'M\u00e9decine g\u00e9n\u00e9rale',
      description: 'Consultations de m\u00e9decine de famille pour tous les \u00e2ges.',
      color: '#2563eb',
      bgColor: 'transparent',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>'
    },
    {
      title: 'P\u00e9diatrie',
      description: 'Soins sp\u00e9cialis\u00e9s pour nourrissons, enfants et adolescents.',
      color: '#2563eb',
      bgColor: 'transparent',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 1.5-2 1.5c-2.5 0-3.2 2-3.2 2s1.5-1.5 2.5-1.5c1.6 0 2.5.5 3.2 1.2z"/></svg>'
    },
    {
      title: 'Chirurgie',
      description: 'Chirurgie g\u00e9n\u00e9rale et digestive avec suivi post-op\u00e9ratoire.',
      color: '#2563eb',
      bgColor: 'transparent',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>'
    },
    {
      title: 'Laboratoire',
      description: 'Analyses biologiques et diagnostics avec technologie de pointe.',
      color: '#2563eb',
      bgColor: 'transparent',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>'
    },
    {
      title: 'Ophtalmologie',
      description: 'Soins oculaires complets et services de vision.',
      color: '#2563eb',
      bgColor: 'transparent',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
    },
    {
      title: 'Urgences',
      description: 'Services m\u00e9dicaux d\'urgence 24h/24, 7j/7.',
      color: '#2563eb',
      bgColor: 'transparent',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.685-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><circle cx="17" cy="18" r="2"/><circle cx="5" cy="18" r="2"/></svg>'
    }
  ];

  doctors = [
    {
      image: 'assets/images/doctor1.png',
      name: 'Dr. Fatima El Khaldi',
      specialty: 'Cardiologie',
      description: 'Cardiologue sp\u00e9cialis\u00e9e en cardiologie interventionnelle et suivi des pathologies cardiaques.'
    },
    {
      image: 'assets/images/doctor2.png',
      name: 'Dr. Karim Benali',
      specialty: 'M\u00e9decine G\u00e9n\u00e9rale',
      description: 'M\u00e9decin g\u00e9n\u00e9raliste exp\u00e9riment\u00e9 avec 15 ans d\'exp\u00e9rience en diagnostic et suivi patient.'
    },
    {
      image: 'assets/images/medical-team.png',
      name: '\u00c9quipe pluridisciplinaire',
      specialty: 'Soins collaboratifs',
      description: 'Notre \u00e9quipe m\u00e9dicale collabore pour offrir des plans de traitement complets et personnalis\u00e9s.'
    }
  ];

  cities = [
    { name: 'Casablanca', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>', count: 25 },
    { name: 'Rabat', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 20 7 4 7"/><path d="M22 22H2"/><path d="M6 7v9"/><path d="M10 7v9"/><path d="M14 7v9"/><path d="M18 7v9"/><path d="M4 16h16"/></svg>', count: 18 },
    { name: 'Marrakech', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>', count: 15 },
    { name: 'F\u00e8s', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 20v-6a2 2 0 0 0-2-2h-3.83a2 2 0 0 1-1.41-.59L12 9l-2.76 2.41a2 2 0 0 1-1.41.59H4a2 2 0 0 0-2 2v6"/><path d="M2 20h20"/><path d="M10 20v-4a2 2 0 0 1 4 0v4"/><path d="M2 14h20"/><path d="M6 10V4h12v6"/></svg>', count: 12 },
    { name: 'Tanger', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>', count: 10 },
    { name: 'Agadir', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12a10.06 10.06 1 0 0-20 0Z"/><path d="M12 12v8"/><path d="M12 2v10"/><path d="m9.1 5.5 5.8 6.5"/><path d="m14.9 5.5-5.8 6.5"/><path d="M8 20h8"/></svg>', count: 8 }
  ];

  ngOnInit() {
    setTimeout(() => this.heroVisible.set(true), 100);
  }

  ngAfterViewInit() {
    this.observe(this.servicesRef, this.servicesVisible);
    this.observe(this.doctorsRef, this.doctorsVisible);

    this.observe(this.appointmentRef, this.appointmentVisible);
    this.observe(this.citiesRef, this.citiesVisible);
  }

  private observe(ref: ElementRef, sig: ReturnType<typeof signal<boolean>>) {
    if (!ref?.nativeElement) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            sig.set(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(ref.nativeElement);
  }
}
