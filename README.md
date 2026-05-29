# MediSync - Systeme de Gestion de Clinique Medicale

Application web et mobile complete pour la gestion d'une clinique medicale multi-praticiens.

## Stack Technologique

| Composant | Technologies |
|-----------|-------------|
| **Backend** | Spring Boot 3.2, Java 17, Spring Security, JWT, OAuth2 |
| **Frontend** | Angular 17, TypeScript, PrimeNG, Chart.js, FullCalendar, Leaflet, Lucide icons |
| **PDF** | jsPDF + jspdf-autotable (ordonnances, factures, rapports) |
| **Mobile** | Flutter 3.x, Provider, Firebase Messaging |
| **Base de donnees** | PostgreSQL (Supabase) |
| **Stockage** | Supabase Storage (S3 compatible) |
| **Emails** | Resend API |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **Devise** | Dirham marocain (MAD), locale fr-MA |

## Fonctionnalites

### Authentification & Securite
- Inscription/Connexion par email
- OAuth2 Google (SSO)
- Authentification 2FA (TOTP)
- Tokens JWT avec expiration
- Gestion des roles (Patient, Medecin, Secretaire, Admin)

### Module Patient
- Recherche de medecins par specialite/localisation
- Prise de rendez-vous en temps reel
- Visualisation des creneaux disponibles
- Historique des consultations
- Documents medicaux (upload/download)
- Notifications de rappel (email + push)

### Module Medecin
- Agenda interactif FullCalendar (vue jour/semaine/mois)
- Gestion des disponibilites (recurrentes + ponctuelles)
- FAB "Urgence" pour bloquer un creneau a la volee
- Dialog "Marquer disponible" sur clic d'un creneau vide
- Dossier patient complet
- Redaction de consultations (split list/form)
- Prescriptions electroniques avec generation PDF
- Statistiques personnelles

### Module Secretaire
- **Agenda timeline** 08h-18h tous medecins confondus avec stats live
- **Gestion des RDV** : filtres date/medecin/statut, creation avec autocomplete patient + grille de creneaux
- **Annuaire patients** : recherche, table, dialog creation avec groupe sanguin et mot de passe initial
- **Facturation** : 4 KPI (total, paye mois, en attente, impayees), table factures, dialog paiement (especes/carte/cheque/virement)

### Module Administrateur
- Dashboard 4 KPI pastel : Patients / Medecins / RDV / Revenus
- Bar chart consultations par medecin (Chart.js)
- Line chart revenus 30 jours (DH)
- Tables d'activite recente (RDV et consultations)
- Gestion utilisateurs / medecins / cliniques / salles
- 2FA TOTP (Google Authenticator compatible)
- Rapports financiers avec graphiques
- Export PDF des rapports

### Application Mobile (Flutter)
- Interface patient optimisee
- Authentification biometrique
- Geolocalisation des cliniques
- Notifications push (Firebase)
- Mode hors ligne partiel

## Architecture

```
medisync/
├── backend/                     # API REST Spring Boot
│   └── src/main/java/com/medisync/
│       ├── config/             # Security, CORS, Firebase
│       ├── controller/         # REST Controllers
│       ├── dto/                # Data Transfer Objects
│       ├── entity/             # Entites JPA (User, Patient, Medecin...)
│       ├── repository/         # Spring Data JPA
│       ├── security/           # JWT, OAuth2, UserDetails
│       └── service/            # Logique metier, Scheduler
├── frontend/                    # Application Angular 17
│   └── src/app/
│       ├── core/               # Services, Guards, Interceptors
│       ├── features/           # Modules par role
│       │   ├── patient/        # Dashboard, RDV, Documents
│       │   ├── medecin/        # Agenda, Consultations
│       │   ├── secretaire/     # Gestion patients/RDV
│       │   └── admin/          # Dashboard, Rapports
│       └── shared/             # Composants reutilisables
├── mobile/                      # Application Flutter
│   └── lib/
│       ├── models/             # Modeles Dart
│       ├── providers/          # State management
│       ├── screens/            # Ecrans UI
│       └── services/           # API, Auth, Notifications
└── docs/                        # Documentation
    ├── README-technique.md     # Documentation technique
    └── DEMO-GUIDE.md           # Guide de demonstration
```

## Installation

### Pre-requis
- Java 17+
- Node.js 18+
- Flutter 3.x
- Maven 3.8+

### Configuration

1. **Variables d'environnement** - Creer un fichier `.env` dans `backend/`:
```env
# Base de donnees Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
DATABASE_URL=jdbc:postgresql://...

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRATION=86400000

# OAuth2 Google
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Resend (Emails)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Supabase Storage
SUPABASE_STORAGE_URL=your_storage_url
```

2. **Firebase** - Placer `firebase-service-account.json` dans `backend/src/main/resources/`

### Demarrage

```bash
# Backend (Terminal 1)
cd backend
mvn spring-boot:run
# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html

# Frontend (Terminal 2)
cd frontend
npm install
ng serve
# App: http://localhost:4200

# Mobile (Terminal 3)
cd mobile
flutter pub get
flutter run
```

## API Endpoints

### Authentification
| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription patient |
| POST | `/api/auth/login` | Connexion (retourne JWT) |
| POST | `/api/auth/2fa/setup` | Configuration 2FA |
| GET | `/oauth2/authorization/google` | OAuth2 Google |

### Patient
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/patient/profile` | Profil patient |
| GET | `/api/patient/appointments` | Mes rendez-vous |
| POST | `/api/patient/appointments` | Creer un RDV |
| DELETE | `/api/patient/appointments/{id}` | Annuler un RDV |
| GET | `/api/patient/documents` | Mes documents |
| POST | `/api/patient/documents/upload` | Upload document |

### Medecin
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/medecin/appointments` | Agenda du medecin |
| GET | `/api/medecin/patients` | Liste des patients |
| POST | `/api/medecin/consultations` | Creer consultation |
| GET | `/api/medecin/disponibilites` | Mes disponibilites |
| POST | `/api/medecin/disponibilites` | Ajouter disponibilite |

### Public
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/public/medecins` | Liste des medecins |
| GET | `/api/public/medecins/{id}/creneaux` | Creneaux disponibles |
| GET | `/api/public/specialites` | Liste des specialites |

### Admin
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/dashboard` | Statistiques globales |
| GET | `/api/admin/users` | Gestion utilisateurs |
| GET | `/api/admin/reports/financial` | Rapports financiers |

## Services Externes

| Service | Utilisation |
|---------|-------------|
| **Supabase** | Base PostgreSQL + Stockage fichiers |
| **Resend** | Emails transactionnels (confirmations, rappels) |
| **Firebase FCM** | Notifications push mobile |
| **Google OAuth2** | Connexion SSO |

## Rappels Automatiques

Le systeme envoie automatiquement des rappels de RDV:
- **24h avant** - Email + Push notification
- **1h avant** - Email + Push notification
- **Le matin meme** - Email + Push notification (7h00)

## Comptes de demonstration

Le `DataInitializer` cree automatiquement au premier lancement (si la table `users` est vide) :

| Role | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@medisync.ma` | `Test@2026` |
| Secretaire | `secretaire@medisync.ma` | `Test@2026` |
| Patient | `patient@test.ma` | `Test@2026` |
| Medecin generaliste | `dr.benali@medisync.ma` | `Test@2026` |
| Medecin cardiologue | `dr.elkhaldi@medisync.ma` | `Test@2026` |
| Medecin dermatologue | `dr.tazi@medisync.ma` | `Test@2026` |
| Medecin pediatre | `dr.amrani@medisync.ma` | `Test@2026` |
| Medecin generaliste | `dr.berrada@medisync.ma` | `Test@2026` |
| Medecin chirurgien | `dr.fassi@medisync.ma` | `Test@2026` |

## Deploiement

### Architecture recommandee

| Composant | Plateforme |
|-----------|------------|
| Frontend Angular | **Vercel** (gratuit, SSL auto, CDN global) |
| Backend Spring Boot | **Render** ou **Railway** (Vercel ne supporte pas la JVM) |
| Base PostgreSQL | **Supabase** (deja configure) |
| Storage fichiers | **Supabase Storage** |

### Frontend sur Vercel

1. Importer le repo GitHub sur https://vercel.com/new
2. Selectionner le dossier racine : `frontend/`
3. Framework : **Angular** (auto-detecte)
4. Build command : `npm run build`
5. Output directory : `dist/medisync/browser`
6. Variable d'environnement : modifier `frontend/src/environments/environment.prod.ts` avec l'URL du backend de production

### Backend sur Render

1. Creer un Web Service sur https://render.com/
2. Connecter le repo, root directory : `backend/`
3. Build command : `mvn clean package -DskipTests`
4. Start command : `java -jar target/medisync-backend-1.0.0.jar`
5. Ajouter les variables d'environnement (voir section Configuration)
6. Adapter le CORS dans `SecurityConfig.java` pour autoriser le domaine Vercel

## Documentation

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **Documentation technique**: `docs/README-technique.md`
- **Guide de demo**: `docs/DEMO-GUIDE.md`

## Licence

Projet academique - Developpement Web & Mobile 2024-2026

---

*Developpe avec Spring Boot, Angular, et Flutter*
