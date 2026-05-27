# MediSync - Systeme de Gestion de Clinique Medicale

Application web et mobile complete pour la gestion d'une clinique medicale multi-praticiens.

## Stack Technologique

| Composant | Technologies |
|-----------|-------------|
| **Backend** | Spring Boot 3.2, Java 17, Spring Security, JWT, OAuth2 |
| **Frontend** | Angular 17 (Standalone Components), TypeScript, Leaflet |
| **Mobile** | Flutter 3.x, Provider, Firebase Messaging |
| **Base de donnees** | PostgreSQL (Supabase) |
| **Stockage** | Supabase Storage (S3 compatible) |
| **Emails** | Resend API |
| **Notifications** | Firebase Cloud Messaging (FCM) |

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
- Agenda interactif
- Gestion des disponibilites
- Dossier patient complet
- Redaction de consultations
- Prescriptions electroniques
- Statistiques personnelles

### Module Secretaire
- Gestion des patients
- Prise de RDV pour patients
- Confirmation/Annulation de RDV
- Facturation et encaissements

### Module Administrateur
- Dashboard avec KPIs
- Gestion des utilisateurs
- Gestion des medecins et specialites
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

## Documentation

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **Documentation technique**: `docs/README-technique.md`
- **Guide de demo**: `docs/DEMO-GUIDE.md`

## Licence

Projet academique - Developpement Web & Mobile 2024-2026

---

*Developpe avec Spring Boot, Angular, et Flutter*
