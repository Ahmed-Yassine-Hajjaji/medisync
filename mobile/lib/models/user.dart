class User {
  final int id;
  final String email;
  final String nom;
  final String prenom;
  final String role;
  final String? token;

  User({
    required this.id,
    required this.email,
    required this.nom,
    required this.prenom,
    required this.role,
    this.token,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      nom: json['nom'],
      prenom: json['prenom'],
      role: json['role'],
      token: json['token'],
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
    };
  }
}

class Appointment {
  final int id;
  final int patientId;
  final int medecinId;
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
    required this.medecinNom,
    required this.medecinPrenom,
    required this.medecinSpecialite,
    required this.date,
    required this.heureDebut,
    required this.heureFin,
    required this.motif,
    required this.statut,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'],
      patientId: json['patientId'],
      medecinId: json['medecinId'],
      medecinNom: json['medecinNom'],
      medecinPrenom: json['medecinPrenom'],
      medecinSpecialite: json['medecinSpecialite'],
      date: json['date'],
      heureDebut: json['heureDebut'],
      heureFin: json['heureFin'],
      motif: json['motif'],
      statut: json['statut'],
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
  });

  factory Medecin.fromJson(Map<String, dynamic> json) {
    return Medecin(
      id: json['id'],
      nom: json['nom'],
      prenom: json['prenom'],
      specialite: json['specialite'],
      description: json['description'],
      tarifConsultation: json['tarifConsultation']?.toDouble(),
      dureeConsultation: json['dureeConsultation'],
      noteMoyenne: json['noteMoyenne']?.toDouble(),
      nombreAvis: json['nombreAvis'],
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
      date: json['date'],
      heureDebut: json['heureDebut'],
      heureFin: json['heureFin'],
      disponible: json['disponible'],
    );
  }
}
