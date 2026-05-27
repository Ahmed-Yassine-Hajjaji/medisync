class Consultation {
  final int id;
  final int? appointmentId;
  final int patientId;
  final String patientNom;
  final int medecinId;
  final String medecinNom;
  final String? motif;
  final String? symptomes;
  final String? diagnostic;
  final String? compteRendu;
  final String? recommandations;
  final String dateConsultation;
  final List<Prescription> prescriptions;

  Consultation({
    required this.id,
    this.appointmentId,
    required this.patientId,
    required this.patientNom,
    required this.medecinId,
    required this.medecinNom,
    this.motif,
    this.symptomes,
    this.diagnostic,
    this.compteRendu,
    this.recommandations,
    required this.dateConsultation,
    this.prescriptions = const [],
  });

  factory Consultation.fromJson(Map<String, dynamic> json) {
    return Consultation(
      id: json['id'],
      appointmentId: json['appointmentId'],
      patientId: json['patientId'],
      patientNom: json['patientNom'] ?? '',
      medecinId: json['medecinId'],
      medecinNom: json['medecinNom'] ?? '',
      motif: json['motif'],
      symptomes: json['symptomes'],
      diagnostic: json['diagnostic'],
      compteRendu: json['compteRendu'],
      recommandations: json['recommandations'],
      dateConsultation: json['dateConsultation'],
      prescriptions: json['prescriptions'] != null
          ? (json['prescriptions'] as List)
              .map((p) => Prescription.fromJson(p))
              .toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'appointmentId': appointmentId,
      'patientId': patientId,
      'patientNom': patientNom,
      'medecinId': medecinId,
      'medecinNom': medecinNom,
      'motif': motif,
      'symptomes': symptomes,
      'diagnostic': diagnostic,
      'compteRendu': compteRendu,
      'recommandations': recommandations,
      'dateConsultation': dateConsultation,
      'prescriptions': prescriptions.map((p) => p.toJson()).toList(),
    };
  }
}

class Prescription {
  final int? id;
  final int? consultationId;
  final int patientId;
  final String? patientNom;
  final int medecinId;
  final String? medecinNom;
  final String medicament;
  final String dosage;
  final String frequence;
  final int dureeJours;
  final String? instructions;
  final String dateDebut;
  final String? dateFin;
  final bool renouvellementAutorise;
  final int? nombreRenouvellements;

  Prescription({
    this.id,
    this.consultationId,
    required this.patientId,
    this.patientNom,
    required this.medecinId,
    this.medecinNom,
    required this.medicament,
    required this.dosage,
    required this.frequence,
    required this.dureeJours,
    this.instructions,
    required this.dateDebut,
    this.dateFin,
    this.renouvellementAutorise = false,
    this.nombreRenouvellements,
  });

  factory Prescription.fromJson(Map<String, dynamic> json) {
    return Prescription(
      id: json['id'],
      consultationId: json['consultationId'],
      patientId: json['patientId'],
      patientNom: json['patientNom'],
      medecinId: json['medecinId'],
      medecinNom: json['medecinNom'],
      medicament: json['medicament'],
      dosage: json['dosage'],
      frequence: json['frequence'],
      dureeJours: json['dureeJours'],
      instructions: json['instructions'],
      dateDebut: json['dateDebut'],
      dateFin: json['dateFin'],
      renouvellementAutorise: json['renouvellementAutorise'] ?? false,
      nombreRenouvellements: json['nombreRenouvellements'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'consultationId': consultationId,
      'patientId': patientId,
      'patientNom': patientNom,
      'medecinId': medecinId,
      'medecinNom': medecinNom,
      'medicament': medicament,
      'dosage': dosage,
      'frequence': frequence,
      'dureeJours': dureeJours,
      'instructions': instructions,
      'dateDebut': dateDebut,
      'dateFin': dateFin,
      'renouvellementAutorise': renouvellementAutorise,
      'nombreRenouvellements': nombreRenouvellements,
    };
  }
}
