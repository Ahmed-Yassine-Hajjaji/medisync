class User {
  final int id;
  final String email;
  final String nom;
  final String prenom;
  final String role;
  final String? token;
  final String? telephone;
  final String? dateNaissance;
  final String? adresse;
  final String? groupeSanguin;
  final String? specialite;
  final bool? enabled;

  User({
    required this.id,
    required this.email,
    required this.nom,
    required this.prenom,
    required this.role,
    this.token,
    this.telephone,
    this.dateNaissance,
    this.adresse,
    this.groupeSanguin,
    this.specialite,
    this.enabled,
  });

  String get fullName => '$prenom $nom';
  String get initials => '${prenom.isNotEmpty ? prenom[0] : ''}${nom.isNotEmpty ? nom[0] : ''}'.toUpperCase();

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'] ?? '',
      nom: json['nom'] ?? '',
      prenom: json['prenom'] ?? '',
      role: json['role'] ?? 'PATIENT',
      token: json['token'],
      telephone: json['telephone'],
      dateNaissance: json['dateNaissance'],
      adresse: json['adresse'],
      groupeSanguin: json['groupeSanguin'],
      specialite: json['specialite'],
      enabled: json['enabled'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'nom': nom,
      'prenom': prenom,
      'role': role,
      'token': token,
      'telephone': telephone,
      'dateNaissance': dateNaissance,
      'adresse': adresse,
      'groupeSanguin': groupeSanguin,
      'specialite': specialite,
      'enabled': enabled,
    };
  }
}

class Appointment {
  final int id;
  final int patientId;
  final int medecinId;
  final String? patientNom;
  final String? patientPrenom;
  final String medecinNom;
  final String medecinPrenom;
  final String medecinSpecialite;
  final String date;
  final String heureDebut;
  final String heureFin;
  final String motif;
  final String statut;

  Appointment({
    required this.id,
    required this.patientId,
    required this.medecinId,
    this.patientNom,
    this.patientPrenom,
    required this.medecinNom,
    required this.medecinPrenom,
    required this.medecinSpecialite,
    required this.date,
    required this.heureDebut,
    required this.heureFin,
    required this.motif,
    required this.statut,
  });

  String get patientFullName => '${patientPrenom ?? ''} ${patientNom ?? ''}'.trim();
  String get medecinFullName => '$medecinPrenom $medecinNom';

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'],
      patientId: json['patientId'] ?? 0,
      medecinId: json['medecinId'] ?? 0,
      patientNom: json['patientNom'],
      patientPrenom: json['patientPrenom'],
      medecinNom: json['medecinNom'] ?? '',
      medecinPrenom: json['medecinPrenom'] ?? '',
      medecinSpecialite: json['medecinSpecialite'] ?? '',
      date: json['date'] ?? '',
      heureDebut: json['heureDebut'] ?? '',
      heureFin: json['heureFin'] ?? '',
      motif: json['motif'] ?? '',
      statut: json['statut'] ?? '',
    );
  }
}

class Medecin {
  final int id;
  final String nom;
  final String prenom;
  final String specialite;
  final String? description;
  final double? tarifConsultation;
  final int? dureeConsultation;
  final double? noteMoyenne;
  final int? nombreAvis;
  final String? telephone;
  final String? email;
  final bool? enabled;

  Medecin({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.specialite,
    this.description,
    this.tarifConsultation,
    this.dureeConsultation,
    this.noteMoyenne,
    this.nombreAvis,
    this.telephone,
    this.email,
    this.enabled,
  });

  String get fullName => '$prenom $nom';
  String get initials => '${prenom.isNotEmpty ? prenom[0] : ''}${nom.isNotEmpty ? nom[0] : ''}'.toUpperCase();

  factory Medecin.fromJson(Map<String, dynamic> json) {
    return Medecin(
      id: json['id'],
      nom: json['nom'] ?? '',
      prenom: json['prenom'] ?? '',
      specialite: json['specialite'] ?? '',
      description: json['description'],
      tarifConsultation: json['tarifConsultation']?.toDouble(),
      dureeConsultation: json['dureeConsultation'],
      noteMoyenne: json['noteMoyenne']?.toDouble(),
      nombreAvis: json['nombreAvis'],
      telephone: json['telephone'],
      email: json['email'],
      enabled: json['enabled'],
    );
  }
}

class Creneau {
  final String date;
  final String heureDebut;
  final String heureFin;
  final bool disponible;

  Creneau({
    required this.date,
    required this.heureDebut,
    required this.heureFin,
    required this.disponible,
  });

  factory Creneau.fromJson(Map<String, dynamic> json) {
    return Creneau(
      date: json['date'] ?? '',
      heureDebut: json['heureDebut'] ?? '',
      heureFin: json['heureFin'] ?? '',
      disponible: json['disponible'] ?? false,
    );
  }
}

class Invoice {
  final int id;
  final int? patientId;
  final String? patientNom;
  final String? patientPrenom;
  final String? numeroFacture;
  final double montantTotal;
  final double montantPaye;
  final String statut;
  final String? dateFacture;
  final String? modePaiement;

  Invoice({
    required this.id,
    this.patientId,
    this.patientNom,
    this.patientPrenom,
    this.numeroFacture,
    required this.montantTotal,
    required this.montantPaye,
    required this.statut,
    this.dateFacture,
    this.modePaiement,
  });

  double get resteAPayer => montantTotal - montantPaye;
  String get patientFullName => '${patientPrenom ?? ''} ${patientNom ?? ''}'.trim();

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'],
      patientId: json['patientId'],
      patientNom: json['patientNom'],
      patientPrenom: json['patientPrenom'],
      numeroFacture: json['numeroFacture'],
      montantTotal: (json['montantTotal'] ?? 0).toDouble(),
      montantPaye: (json['montantPaye'] ?? 0).toDouble(),
      statut: json['statut'] ?? '',
      dateFacture: json['dateFacture'],
      modePaiement: json['modePaiement'],
    );
  }
}

class DashboardStats {
  final int totalPatients;
  final int totalMedecins;
  final int rdvAujourdhui;
  final double revenusMois;

  DashboardStats({
    required this.totalPatients,
    required this.totalMedecins,
    required this.rdvAujourdhui,
    required this.revenusMois,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalPatients: json['totalPatients'] ?? 0,
      totalMedecins: json['totalMedecins'] ?? 0,
      rdvAujourdhui: json['rdvAujourdhui'] ?? 0,
      revenusMois: (json['revenusMois'] ?? 0).toDouble(),
    );
  }
}

class Disponibilite {
  final int? id;
  final String jourSemaine;
  final String heureDebut;
  final String heureFin;
  final bool? conge;

  Disponibilite({
    this.id,
    required this.jourSemaine,
    required this.heureDebut,
    required this.heureFin,
    this.conge,
  });

  factory Disponibilite.fromJson(Map<String, dynamic> json) {
    return Disponibilite(
      id: json['id'],
      jourSemaine: json['jourSemaine'] ?? '',
      heureDebut: json['heureDebut'] ?? '',
      heureFin: json['heureFin'] ?? '',
      conge: json['conge'],
    );
  }

  Map<String, dynamic> toJson() => {
    'jourSemaine': jourSemaine,
    'heureDebut': heureDebut,
    'heureFin': heureFin,
    'conge': conge ?? false,
  };
}
