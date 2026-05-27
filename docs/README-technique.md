# MediSync - Documentation Technique

## Table des matieres

1. [Architecture du systeme](#1-architecture-du-systeme)
2. [Schema de base de donnees](#2-schema-de-base-de-donnees)
3. [Guide d'installation](#3-guide-dinstallation)
4. [Guide de deploiement](#4-guide-de-deploiement)
5. [API Reference](#5-api-reference)
6. [Securite](#6-securite)

---

## 1. Architecture du systeme

### 1.1 Vue d'ensemble

MediSync est une application de gestion de clinique medicale construite avec une architecture moderne en trois tiers:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                      │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│   Angular 17    │   Flutter       │        API REST                 │
│   (Web Admin)   │   (Mobile)      │     (Integrations)              │
└────────┬────────┴────────┬────────┴─────────────┬───────────────────┘
         │                 │                       │
         └─────────────────┼───────────────────────┘
                           │ HTTPS / JWT
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot 3.2)                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Controllers │  │   Services   │  │ Repositories │              │
│  │  (REST API)  │◄─┤  (Business)  │◄─┤    (JPA)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Security   │  │   Scheduler  │  │   Firebase   │              │
│  │  (JWT/OAuth) │  │  (Reminders) │  │    (FCM)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │    Supabase     │  │     Resend      │
│   (Supabase)    │  │    Storage      │  │    (Email)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 1.2 Stack technologique

#### Backend
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Spring Boot | 3.2.5 |
| Langage | Java | 17 |
| ORM | Hibernate/JPA | 6.x |
| Securite | Spring Security | 6.x |
| Base de donnees | PostgreSQL | 15+ |
| Documentation API | SpringDoc OpenAPI | 2.5.0 |
| Email | Resend API | - |
| Push Notifications | Firebase Admin SDK | 9.2.0 |

#### Frontend Web
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Angular | 17.3.0 |
| Langage | TypeScript | 5.4.0 |
| State Management | RxJS | 7.8.0 |
| UI Components | Angular Material | 17.x |
| Charts | ngx-charts | 20.5.0 |
| Maps | Leaflet + ngx-leaflet | 1.9.4 |
| PDF | jsPDF | 2.5.1 |

#### Mobile
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Flutter | 3.x |
| Langage | Dart | 3.x |
| State Management | Provider | 6.x |
| Maps | flutter_map | 6.x |
| Notifications | firebase_messaging | 14.x |
| Auth biometrique | local_auth | 2.x |

### 1.3 Modules fonctionnels

```
MediSync/
├── Module Authentification
│   ├── Login/Register
│   ├── OAuth2 Google
│   ├── 2FA (TOTP)
│   └── Gestion sessions JWT
│
├── Module Patient
│   ├── Recherche medecins
│   ├── Prise de rendez-vous
│   ├── Dossier medical
│   ├── Ordonnances
│   ├── Documents medicaux
│   └── Rappels medicaments
│
├── Module Medecin
│   ├── Planning/Disponibilites
│   ├── Consultations
│   ├── Prescriptions
│   └── Dossiers patients
│
├── Module Secretaire
│   ├── Gestion rendez-vous
│   ├── Accueil patients
│   └── Facturation
│
└── Module Admin
    ├── Gestion personnel
    ├── Rapports financiers
    ├── Configuration salles
    └── Parametres systeme
```

---

## 2. Schema de base de donnees

### 2.1 Diagramme Entite-Relation

```
┌──────────────────┐       ┌──────────────────┐
│      USERS       │       │    CLINIQUE      │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ email (UNIQUE)   │       │ nom              │
│ password         │       │ adresse          │
│ nom              │       │ telephone        │
│ prenom           │       │ email            │
│ telephone        │       │ horaires         │
│ role (ENUM)      │       │ latitude         │
│ enabled          │       │ longitude        │
│ two_factor_*     │       └──────────────────┘
│ fcm_token        │
│ created_at       │
│ updated_at       │
└────────┬─────────┘
         │
         │ INHERITANCE (JOINED)
         │
    ┌────┴────┬─────────────┬──────────────┐
    │         │             │              │
    ▼         ▼             ▼              ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌────────────┐
│PATIENT │ │MEDECIN │ │SECRETAIRE│ │   ADMIN    │
├────────┤ ├────────┤ ├──────────┤ ├────────────┤
│numero  │ │specialite│          │ │            │
│_secu   │ │description           │ │            │
│date_   │ │tarif     │          │ │            │
│naissance││duree_    │          │ │            │
│adresse │ │consultation          │ │            │
│groupe  │ │note_     │          │ │            │
│_sanguin││moyenne   │          │ │            │
└───┬────┘ └────┬────┘ └──────────┘ └────────────┘
    │           │
    │           │
    ▼           ▼
┌─────────────────────────────────────────────┐
│              APPOINTMENT                     │
├─────────────────────────────────────────────┤
│ id (PK)                                      │
│ patient_id (FK) ──────────────────────────┐ │
│ medecin_id (FK) ────────────────────────┐ │ │
│ date                                    │ │ │
│ heure_debut                             │ │ │
│ heure_fin                               │ │ │
│ motif (ENUM)                            │ │ │
│ statut (ENUM)                           │ │ │
│ rappel_envoye_24h                       │ │ │
│ rappel_envoye_1h                        │ │ │
│ notes                                   │ │ │
└─────────────────────────────────────────┘ │ │
                                            │ │
┌─────────────────────────────────────────┐ │ │
│             CONSULTATION                 │ │ │
├─────────────────────────────────────────┤ │ │
│ id (PK)                                  │ │ │
│ appointment_id (FK) ◄────────────────────┘ │ │
│ patient_id (FK) ◄──────────────────────────┘ │
│ medecin_id (FK) ◄────────────────────────────┘
│ motif                                    │
│ symptomes                                │
│ diagnostic                               │
│ compte_rendu                             │
│ recommandations                          │
│ date_consultation                        │
└──────────────┬──────────────────────────┘
               │
               │ 1:N
               ▼
┌─────────────────────────────────────────┐
│            PRESCRIPTION                  │
├─────────────────────────────────────────┤
│ id (PK)                                  │
│ consultation_id (FK)                     │
│ patient_id (FK)                          │
│ medecin_id (FK)                          │
│ medicament                               │
│ dosage                                   │
│ frequence                                │
│ duree_jours                              │
│ instructions                             │
│ date_debut                               │
│ date_fin                                 │
│ renouvellement_autorise                  │
│ nombre_renouvellements                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          MEDICAL_DOCUMENT                │
├─────────────────────────────────────────┤
│ id (PK)                                  │
│ patient_id (FK)                          │
│ filename                                 │
│ original_name                            │
│ mime_type                                │
│ size                                     │
│ category (ENUM)                          │
│ url                                      │
│ upload_date                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│              INVOICE                     │
├─────────────────────────────────────────┤
│ id (PK)                                  │
│ numero_facture (UNIQUE)                  │
│ consultation_id (FK)                     │
│ patient_id (FK)                          │
│ date_facture                             │
│ date_echeance                            │
│ montant_total                            │
│ montant_paye                             │
│ statut (ENUM)                            │
│ mode_paiement                            │
│ actes                                    │
│ details                                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         SALLE_CONSULTATION               │
├─────────────────────────────────────────┤
│ id (PK)                                  │
│ numero                                   │
│ nom                                      │
│ type (ENUM)                              │
│ etage                                    │
│ capacite                                 │
│ equipements (JSON)                       │
│ disponible                               │
│ medecin_id (FK)                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           DISPONIBILITE                  │
├─────────────────────────────────────────┤
│ id (PK)                                  │
│ medecin_id (FK)                          │
│ jour_semaine (ENUM)                      │
│ heure_debut                              │
│ heure_fin                                │
│ active                                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│              REVIEW                      │
├─────────────────────────────────────────┤
│ id (PK)                                  │
│ patient_id (FK)                          │
│ medecin_id (FK)                          │
│ consultation_id (FK)                     │
│ note (1-5)                               │
│ commentaire                              │
│ created_at                               │
└─────────────────────────────────────────┘
```

### 2.2 Types ENUM

```sql
-- Roles utilisateur
CREATE TYPE role AS ENUM ('PATIENT', 'MEDECIN', 'SECRETAIRE', 'ADMIN');

-- Statut rendez-vous
CREATE TYPE statut_appointment AS ENUM (
    'EN_ATTENTE', 'CONFIRME', 'ANNULE', 'TERMINE', 'NO_SHOW'
);

-- Motif consultation
CREATE TYPE motif_consultation AS ENUM (
    'CONSULTATION_GENERALE', 'SUIVI', 'URGENCE', 'VACCINATION',
    'CERTIFICAT_MEDICAL', 'RENOUVELLEMENT_ORDONNANCE'
);

-- Categorie document
CREATE TYPE categorie_document AS ENUM (
    'ORDONNANCE', 'ANALYSE', 'RADIOLOGIE', 'COMPTE_RENDU',
    'CERTIFICAT', 'AUTRE'
);

-- Statut paiement
CREATE TYPE statut_paiement AS ENUM (
    'EN_ATTENTE', 'PAYE', 'PARTIEL', 'IMPAYE', 'REMBOURSE'
);

-- Type salle
CREATE TYPE type_salle AS ENUM (
    'CONSULTATION', 'SOINS', 'RADIOLOGIE', 'CHIRURGIE', 'ATTENTE'
);

-- Jour semaine
CREATE TYPE jour_semaine AS ENUM (
    'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'
);
```

---

## 3. Guide d'installation

### 3.1 Prerequisites

- **Java**: JDK 17+
- **Node.js**: 18+
- **Flutter**: 3.x
- **PostgreSQL**: 15+ (ou compte Supabase)
- **Git**

### 3.2 Variables d'environnement

Creer un fichier `.env` a la racine du projet:

```env
# Base de donnees PostgreSQL (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

# JWT
JWT_SECRET=votre_cle_secrete_jwt_256_bits_minimum
JWT_EXPIRATION=86400000

# Email (Resend)
RESEND_API_KEY=re_xxxxx

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=votre-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# OAuth2 Google
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Application
APP_URL=http://localhost:4200
BACKEND_URL=http://localhost:8080
```

### 3.3 Installation Backend

```bash
# Cloner le projet
git clone https://github.com/Ahmed-Yassine-Hajjaji/medisync.git
cd medisync/backend

# Configurer les variables d'environnement
cp ../application.properties.example src/main/resources/application.properties
# Editer application.properties avec vos valeurs

# Compiler et lancer
./mvnw clean install
./mvnw spring-boot:run
```

Le backend sera accessible sur `http://localhost:8080`

### 3.4 Installation Frontend Angular

```bash
cd medisync/frontend

# Installer les dependances
npm install

# Lancer en mode developpement
npm start
```

L'application sera accessible sur `http://localhost:4200`

### 3.5 Installation Mobile Flutter

```bash
cd medisync/mobile

# Installer les dependances
flutter pub get

# Configurer Firebase
# 1. Telecharger google-services.json (Android) depuis Firebase Console
# 2. Placer dans mobile/android/app/
# 3. Telecharger GoogleService-Info.plist (iOS) depuis Firebase Console
# 4. Placer dans mobile/ios/Runner/

# Lancer sur emulateur/device
flutter run
```

---

## 4. Guide de deploiement

### 4.1 Deploiement Backend (Render / Railway / Heroku)

```bash
# Build du JAR
cd backend
./mvnw clean package -DskipTests

# Le JAR sera dans target/medisync-backend-1.0.0.jar
```

**Variables d'environnement a configurer sur la plateforme:**
- `DATABASE_URL`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 4.2 Deploiement Frontend (Vercel / Netlify)

```bash
cd frontend

# Build de production
npm run build

# Les fichiers seront dans dist/medisync/
```

**Configuration Vercel/Netlify:**
- Build command: `npm run build`
- Output directory: `dist/medisync`
- Environment variable: `API_URL` = URL du backend

### 4.3 Deploiement Mobile

#### Android (Google Play Store)

```bash
cd mobile

# Generer l'APK release
flutter build apk --release

# Ou generer l'App Bundle
flutter build appbundle --release
```

#### iOS (App Store)

```bash
cd mobile

# Build iOS
flutter build ios --release

# Ouvrir Xcode pour archiver
open ios/Runner.xcworkspace
```

### 4.4 Docker (Optionnel)

```dockerfile
# backend/Dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/medisync-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}

  frontend:
    build: ./frontend
    ports:
      - "4200:80"
```

---

## 5. API Reference

### 5.1 Authentification

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription patient |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/refresh` | Rafraichir token |
| GET | `/oauth2/authorization/google` | Login Google |

### 5.2 Patient

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/patient/profile` | Profil patient |
| PUT | `/api/patient/profile` | Modifier profil |
| GET | `/api/patient/appointments` | Mes rendez-vous |
| POST | `/api/patient/appointments` | Prendre RDV |
| PUT | `/api/patient/appointments/{id}/cancel` | Annuler RDV |
| GET | `/api/patient/consultations` | Mes consultations |
| GET | `/api/patient/prescriptions` | Mes ordonnances |
| GET | `/api/patient/documents` | Mes documents |
| POST | `/api/patient/documents/upload` | Upload document |

### 5.3 Medecin

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/medecin/appointments` | Rendez-vous du jour |
| GET | `/api/medecin/planning` | Planning semaine |
| POST | `/api/medecin/consultations/{appointmentId}` | Creer consultation |
| POST | `/api/medecin/prescriptions` | Creer ordonnance |

### 5.4 Admin

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/medecins` | Liste medecins |
| POST | `/api/admin/medecins` | Ajouter medecin |
| GET | `/api/admin/secretaires` | Liste secretaires |
| GET | `/api/admin/financial/stats` | Stats financieres |
| GET | `/api/admin/rooms` | Liste salles |

### 5.5 Documentation Swagger

Accessible sur: `http://localhost:8080/swagger-ui.html`

---

## 6. Securite

### 6.1 Authentification

- **JWT (JSON Web Token)**: Tokens signes avec HS512
- **Expiration**: 24 heures (configurable)
- **Refresh Token**: Rotation automatique

### 6.2 OAuth2 Google

- Connexion sociale pour les patients
- Creation automatique de compte
- Pas de mot de passe stocke

### 6.3 2FA (TOTP)

- Disponible pour les administrateurs
- Compatible Google Authenticator / Authy
- Codes de secours generes

### 6.4 Protection des donnees

- Mots de passe hashes avec BCrypt (cost factor 12)
- Communications HTTPS uniquement en production
- CORS configure pour les origines autorisees
- Protection CSRF desactivee (API stateless)
- Headers de securite (X-Frame-Options, etc.)

### 6.5 Roles et permissions

| Role | Permissions |
|------|-------------|
| PATIENT | Voir/modifier son profil, RDV, documents |
| MEDECIN | Consultations, prescriptions, patients |
| SECRETAIRE | Gestion RDV, accueil, facturation |
| ADMIN | Tout acces + configuration systeme |

---

## Annexes

### A. Structure des dossiers

```
medisync/
├── backend/
│   ├── src/main/java/com/medisync/
│   │   ├── config/          # Configuration Spring
│   │   ├── controller/      # Controllers REST
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # Entites JPA
│   │   ├── repository/      # Repositories Spring Data
│   │   ├── security/        # JWT, OAuth2
│   │   └── service/         # Logique metier
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/
│   └── src/app/
│       ├── core/            # Services, guards, interceptors
│       ├── features/        # Modules fonctionnels
│       └── shared/          # Composants partages
│
├── mobile/
│   └── lib/
│       ├── models/          # Modeles de donnees
│       ├── screens/         # Ecrans
│       └── services/        # Services (API, Auth, etc.)
│
└── docs/
    └── README-technique.md
```

### B. Contacts

- **Developpeur**: Ahmed Yassine Hajjaji
- **Repository**: https://github.com/Ahmed-Yassine-Hajjaji/medisync

---

*Document genere le 27/05/2026 - Version 1.0.0*
