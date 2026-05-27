# MediSync - Guide de Demonstration

## Preparation avant la soutenance

### 1. Configuration de l'environnement

Assurez-vous que les fichiers suivants sont en place:

```bash
# Copier les fichiers de configuration depuis le repertoire parent
cp /home/ahmed/Projects/DevWeb/.env /home/ahmed/Projects/DevWeb/medisync/backend/
cp /home/ahmed/Projects/DevWeb/firebase-service-account.json /home/ahmed/Projects/DevWeb/medisync/backend/src/main/resources/
```

### 2. Demarrage des services

#### Backend (Terminal 1)
```bash
cd backend
mvn spring-boot:run
```
Le backend sera accessible sur `http://localhost:8080`

#### Frontend (Terminal 2)
```bash
cd frontend
npm install
ng serve
```
L'application web sera accessible sur `http://localhost:4200`

#### Mobile (Terminal 3)
```bash
cd mobile
flutter pub get
flutter run
```

### 3. Acces Swagger UI
Documentation API interactive: `http://localhost:8080/swagger-ui.html`

---

## Scenarios de demonstration

### Scenario 1: Inscription et Connexion Patient

**Objectif**: Montrer le flux d'authentification complet

1. **Inscription d'un nouveau patient**
   - Ouvrir `http://localhost:4200/register`
   - Remplir le formulaire:
     - Nom: `Martin`
     - Prenom: `Jean`
     - Email: `jean.martin@example.com`
     - Mot de passe: `Test123!`
     - Telephone: `0612345678`
     - Date de naissance: `1985-03-15`
   - Cliquer sur "S'inscrire"
   - Verifier la redirection vers le dashboard patient

2. **Deconnexion et reconnexion**
   - Cliquer sur le bouton de deconnexion
   - Se reconnecter avec les identifiants crees

3. **Connexion OAuth2 Google** (optionnel)
   - Cliquer sur "Connexion avec Google"
   - Autoriser l'acces
   - Verifier la creation automatique du compte

### Scenario 2: Prise de Rendez-vous

**Objectif**: Demontrer le workflow complet de prise de RDV

1. **Recherche de medecin**
   - Dans le dashboard patient, cliquer sur "Prendre RDV"
   - Rechercher par specialite: `Generaliste`
   - Ou rechercher par nom: `Dr.`

2. **Selection du creneau**
   - Selectionner un medecin dans la liste
   - Choisir une date disponible dans le calendrier
   - Selectionner un creneau horaire disponible (vert)

3. **Confirmation du rendez-vous**
   - Remplir le motif: `Consultation de routine`
   - Ajouter des notes (optionnel)
   - Confirmer le rendez-vous
   - Verifier l'email de confirmation (si Resend configure)

4. **Visualisation du RDV**
   - Aller dans "Mes Rendez-vous"
   - Verifier que le RDV apparait avec le statut "Confirme"

### Scenario 3: Interface Medecin

**Objectif**: Montrer les fonctionnalites pour les medecins

**Compte de test medecin:**
- Email: (creer via admin ou SQL direct)
- Role: `MEDECIN`

1. **Consultation de l'agenda**
   - Connexion avec compte medecin
   - Vue calendrier avec les RDV du jour
   - Navigation entre les jours/semaines

2. **Gestion d'une consultation**
   - Cliquer sur un RDV dans l'agenda
   - Voir les informations du patient
   - Creer une consultation:
     - Symptomes observes
     - Diagnostic
     - Prescription
   - Sauvegarder la consultation

3. **Gestion des disponibilites**
   - Aller dans "Mes Disponibilites"
   - Ajouter une plage horaire
   - Bloquer un creneau pour absence

### Scenario 4: Administration

**Objectif**: Presenter le panneau d'administration

**Compte de test admin:**
- Email: (creer via SQL ou configuration initiale)
- Role: `ADMIN`

1. **Dashboard administrateur**
   - Vue d'ensemble des statistiques
   - Nombre de patients actifs
   - Rendez-vous du jour
   - Revenus (si module finance actif)

2. **Gestion des utilisateurs**
   - Liste des utilisateurs
   - Filtrage par role (Patient/Medecin/Admin)
   - Activation/Desactivation de compte

3. **Gestion des medecins**
   - Ajouter un nouveau medecin
   - Assigner une specialite
   - Configurer les tarifs de consultation

4. **Rapports financiers**
   - Aller dans "Rapports Financiers"
   - Visualiser les graphiques de revenus
   - Filtrer par periode
   - Exporter en PDF

### Scenario 5: Application Mobile (Flutter)

**Objectif**: Demontrer la version mobile patient

1. **Connexion**
   - Lancer l'application mobile
   - Se connecter avec un compte patient existant
   - Tester l'authentification biometrique (si disponible)

2. **Navigation**
   - Explorer le dashboard mobile
   - Consulter ses rendez-vous
   - Voir ses documents medicaux

3. **Geolocalisation**
   - Ouvrir la carte des cliniques
   - Voir les cliniques a proximite
   - Obtenir l'itineraire

4. **Notifications push**
   - Verifier la reception des notifications de rappel
   - (Necessite Firebase configure)

### Scenario 6: Documents Medicaux

**Objectif**: Montrer le systeme de gestion documentaire

1. **Upload d'un document**
   - En tant que patient, aller dans "Mes Documents"
   - Cliquer sur "Ajouter un document"
   - Selectionner un fichier (PDF, image, ou DICOM)
   - Categoriser le document (Ordonnance, Resultat, etc.)

2. **Consultation des documents**
   - Voir la liste des documents
   - Filtrer par type/date
   - Telecharger un document

3. **Partage avec medecin**
   - Autoriser l'acces a un medecin specifique
   - Verifier l'acces cote medecin

---

## Fonctionnalites techniques a mettre en avant

### Securite
- **JWT Authentication**: Tokens signes avec expiration
- **OAuth2 Google**: Integration SSO
- **2FA TOTP**: Authentification a deux facteurs
- **CORS configurable**: Securite cross-origin
- **Validation des entrees**: Protection contre injections

### Performance
- **Lazy loading Angular**: Chargement differe des modules
- **Pagination cote serveur**: Gestion des grandes listes
- **Cache des donnees**: Optimisation des requetes

### Integrations externes
- **Resend API**: Envoi d'emails transactionnels
- **Firebase FCM**: Notifications push mobiles
- **Supabase Storage**: Stockage de fichiers cloud
- **OpenStreetMap/Leaflet**: Cartes interactives

### Architecture
- **API REST**: Endpoints documentes avec Swagger
- **MapStruct**: Mapping DTO automatique
- **Spring Scheduler**: Rappels automatiques de RDV
- **Strategy Pattern**: Gestion des roles utilisateurs

---

## Donnees de test recommandees

### Patients de test
```sql
-- Creer via l'interface ou SQL
INSERT INTO users (email, password, nom, prenom, role, enabled) VALUES
('patient1@test.com', '$2a$10$...', 'Dupont', 'Marie', 'PATIENT', true),
('patient2@test.com', '$2a$10$...', 'Bernard', 'Pierre', 'PATIENT', true);
```

### Medecins de test
```sql
INSERT INTO users (email, password, nom, prenom, role, enabled) VALUES
('medecin1@test.com', '$2a$10$...', 'Laurent', 'Sophie', 'MEDECIN', true);

INSERT INTO medecins (id, specialite, numero_ordre, tarif_consultation) VALUES
(id_medecin, 'Generaliste', 'ORD123456', 25.00);
```

### Admin de test
```sql
INSERT INTO users (email, password, nom, prenom, role, enabled) VALUES
('admin@medisync.com', '$2a$10$...', 'Admin', 'System', 'ADMIN', true);
```

---

## Questions frequentes pendant la soutenance

### Q: Comment gerez-vous la securite des donnees medicales?
**R**:
- Chiffrement des mots de passe avec BCrypt
- Tokens JWT avec expiration courte
- HTTPS en production
- Validation des autorisations par role
- Pas de stockage de donnees sensibles en clair

### Q: Comment l'application gere-t-elle les conflits de RDV?
**R**:
- Verification de disponibilite avant creation
- Transactions atomiques avec @Transactional
- Validation des creneaux cote serveur

### Q: Quelle est la strategie de notifications?
**R**:
- Emails via Resend (confirmation, rappels)
- Push notifications via Firebase FCM
- Rappels automatiques: 24h, 1h, et matin du RDV
- Service scheduler Spring avec @Scheduled

### Q: Comment avez-vous gere les roles utilisateurs?
**R**:
- Heritage JPA: User -> Patient, Medecin, Secretaire
- Enum Role pour les permissions
- Spring Security avec @PreAuthorize
- Guards Angular pour les routes

### Q: Pourquoi avoir choisi cette stack?
**R**:
- **Spring Boot**: Robustesse, ecosysteme riche, securite integree
- **Angular**: Framework structure, TypeScript, maintenance
- **Flutter**: Code unique iOS/Android, performances natives
- **PostgreSQL/Supabase**: SQL fiable + services cloud integres

---

## Checklist finale avant demo

- [ ] Backend demarre sans erreur
- [ ] Frontend accessible sur localhost:4200
- [ ] Base de donnees connectee
- [ ] Swagger UI fonctionnel
- [ ] Comptes de test crees
- [ ] Donnees de demonstration presentes
- [ ] Firebase configure (optionnel, pour les notifs)
- [ ] Resend configure (optionnel, pour les emails)
- [ ] Emulateur mobile pret (ou device reel)

---

## En cas de probleme

### Erreur de connexion base de donnees
Verifier le fichier `.env` et les variables:
```
SUPABASE_URL=...
SUPABASE_KEY=...
```

### Erreur CORS
Verifier que le frontend est bien sur `http://localhost:4200`

### Erreur JWT
Verifier la variable `JWT_SECRET` dans `.env`

### Application mobile ne demarre pas
```bash
flutter clean
flutter pub get
flutter run
```

---

*Document genere pour la soutenance MediSync - Mai 2026*
