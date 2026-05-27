# MediSync - Systeme de Gestion de Clinique Medicale

## Description
Application web et mobile pour la gestion d'une clinique medicale multi-praticiens.

## Architecture
- **Backend**: Spring Boot 3.2 (API REST + JWT + H2/MySQL)
- **Frontend Web**: Angular 17 (Standalone Components)
- **Mobile**: Flutter 3.x (Android/iOS)

## Acteurs
| Acteur | Description |
|--------|-------------|
| Patient | Prise de RDV, consultation dossier medical, suivi traitements |
| Medecin | Gestion planning, consultations, prescriptions |
| Secretaire | Gestion RDV, accueil patients, facturation |
| Administrateur | Pilotage etablissement, stats, gestion utilisateurs |

## Structure du projet
```
medisync/
├── backend/                    # API Spring Boot
│   └── src/main/java/com/medisync/
│       ├── config/            # Configuration (Security, CORS)
│       ├── controller/        # REST Controllers
│       ├── dto/               # Data Transfer Objects
│       ├── entity/            # Entites JPA
│       ├── repository/        # Repositories Spring Data
│       ├── security/          # JWT, Authentication
│       └── service/           # Services metier
├── frontend/                   # Application Angular
│   └── src/app/
│       ├── core/              # Services, Guards, Models
│       ├── features/          # Modules par role (patient, medecin...)
│       └── shared/            # Composants partages
└── mobile/                     # Application Flutter
    └── lib/
        ├── models/            # Modeles de donnees
        ├── screens/           # Ecrans de l'app
        └── services/          # Services API
```

## Installation et Lancement

### Pre-requis
- Java 17+
- Node.js 18+
- Flutter 3.x
- Maven

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
L'API demarre sur http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

### Frontend Angular
```bash
cd frontend
npm install
ng serve
```
L'application demarre sur http://localhost:4200

### Mobile Flutter
```bash
cd mobile
flutter pub get
flutter run
```

## Configuration

### Variables d'environnement
Copier le fichier `application.properties.example` vers `application.properties` et configurer:
- Base de donnees
- Serveur SMTP pour les emails
- Cle secrete JWT

Les comptes de demonstration sont crees automatiquement au premier lancement (voir `DataInitializer.java`).

## Fonctionnalites principales

### Patient
- Inscription/connexion (email, OAuth)
- Recherche medecins (specialite, disponibilite)
- Prise de RDV en temps reel
- Consultation dossier medical
- Historique ordonnances (PDF)
- Notifications rappels

### Medecin
- Gestion planning (disponibilites, conges)
- Liste patients du jour
- Redaction comptes rendus
- Prescriptions electroniques
- Consultation dossier patient

### Secretaire
- Recherche/creation patients
- Prise de RDV pour patients
- Confirmation/annulation RDV
- Facturation
- Encaissements

### Administrateur
- Tableau de bord (KPIs)
- Gestion medecins/secretaires
- Gestion cliniques
- Rapports financiers
- Audit des acces

## API Endpoints

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Inscription patient |
| POST | /api/auth/login | Connexion |
| GET | /api/public/medecins | Liste medecins |
| GET | /api/public/medecins/{id}/creneaux | Creneaux disponibles |
| GET | /api/patient/appointments | Mes RDV |
| POST | /api/patient/appointments | Creer RDV |
| GET | /api/medecin/appointments | RDV du medecin |
| POST | /api/medecin/consultations/{aptId} | Creer consultation |
| GET | /api/admin/dashboard | Stats admin |

## Technologies

### Backend
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- H2 (dev) / MySQL (prod)
- Lombok, MapStruct
- SpringDoc OpenAPI

### Frontend
- Angular 17
- Standalone Components
- RxJS
- SCSS

### Mobile
- Flutter 3.x
- Provider (state management)
- HTTP package
- Shared Preferences

## Licence
Projet academique - Developpement Web & Mobile
