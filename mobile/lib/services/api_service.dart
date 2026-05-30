import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import '../models/consultation.dart';
import 'auth_service.dart';

class ApiService {
  final AuthService authService;

  ApiService(this.authService);

  String get baseUrl => AuthService.baseUrl;

  // ─── PUBLIC ───
  Future<List<Medecin>> getMedecins() async {
    final response = await http.get(
      Uri.parse('$baseUrl/public/medecins'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Medecin.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement medecins');
  }

  Future<List<Creneau>> getCreneaux(int medecinId, String date) async {
    final response = await http.get(
      Uri.parse('$baseUrl/public/medecins/$medecinId/creneaux?date=$date'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Creneau.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement creneaux');
  }

  // ─── PATIENT ───
  Future<List<Appointment>> getPatientAppointments() async {
    final response = await http.get(
      Uri.parse('$baseUrl/patient/appointments'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Appointment.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement rendez-vous');
  }

  Future<Appointment> createPatientAppointment({
    required int medecinId,
    required String date,
    required String heureDebut,
    required String motif,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/patient/appointments'),
      headers: authService.authHeaders,
      body: jsonEncode({
        'medecinId': medecinId,
        'date': date,
        'heureDebut': heureDebut,
        'motif': motif,
      }),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return Appointment.fromJson(jsonDecode(response.body));
    }
    throw Exception('Erreur creation rendez-vous');
  }

  Future<void> cancelPatientAppointment(int id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/patient/appointments/$id/cancel'),
      headers: authService.authHeaders,
    );
    if (response.statusCode != 200) {
      throw Exception('Erreur annulation rendez-vous');
    }
  }

  Future<void> reschedulePatientAppointment(int id, String newDate, String newTimeSlot) async {
    final response = await http.put(
      Uri.parse('$baseUrl/patient/appointments/$id/reschedule'),
      headers: authService.authHeaders,
      body: jsonEncode({'date': newDate, 'heureDebut': newTimeSlot}),
    );
    if (response.statusCode != 200) {
      throw Exception('Erreur reprogrammation');
    }
  }

  Future<List<Consultation>> getPatientConsultations() async {
    final response = await http.get(
      Uri.parse('$baseUrl/patient/consultations'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Consultation.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement consultations');
  }

  Future<List<Prescription>> getPatientPrescriptions() async {
    final response = await http.get(
      Uri.parse('$baseUrl/patient/prescriptions'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Prescription.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement ordonnances');
  }

  Future<Map<String, dynamic>> getPatientProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/patient/profile'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Erreur chargement profil');
  }

  Future<void> updatePatientProfile(Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/patient/profile'),
      headers: authService.authHeaders,
      body: jsonEncode(data),
    );
    if (response.statusCode != 200) {
      throw Exception('Erreur mise a jour profil');
    }
  }

  Future<void> requestPrescriptionRenewal(int prescriptionId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/patient/prescriptions/$prescriptionId/renewal'),
      headers: authService.authHeaders,
    );
    if (response.statusCode != 200) {
      throw Exception('Erreur demande renouvellement');
    }
  }

  // ─── MEDECIN ───
  Future<List<Appointment>> getMedecinAppointments() async {
    final response = await http.get(
      Uri.parse('$baseUrl/medecin/appointments'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Appointment.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement rendez-vous');
  }

  Future<List<Appointment>> getMedecinAppointmentsByDate(String date) async {
    final response = await http.get(
      Uri.parse('$baseUrl/medecin/appointments/date/$date'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Appointment.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement rendez-vous');
  }

  Future<List<Appointment>> getMedecinAppointmentsByRange(String start, String end) async {
    final response = await http.get(
      Uri.parse('$baseUrl/medecin/appointments/range?start=$start&end=$end'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Appointment.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement rendez-vous');
  }

  Future<void> confirmAppointment(int id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/medecin/appointments/$id/confirm'),
      headers: authService.authHeaders,
    );
    if (response.statusCode != 200) throw Exception('Erreur confirmation');
  }

  Future<void> cancelMedecinAppointment(int id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/medecin/appointments/$id/cancel'),
      headers: authService.authHeaders,
    );
    if (response.statusCode != 200) throw Exception('Erreur annulation');
  }

  Future<void> markNoShow(int id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/medecin/appointments/$id/no-show'),
      headers: authService.authHeaders,
    );
    if (response.statusCode != 200) throw Exception('Erreur marquage absence');
  }

  Future<List<Consultation>> getMedecinConsultations() async {
    final response = await http.get(
      Uri.parse('$baseUrl/medecin/consultations'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Consultation.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement consultations');
  }

  Future<Consultation> createConsultation(int appointmentId, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/medecin/consultations/$appointmentId'),
      headers: authService.authHeaders,
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return Consultation.fromJson(jsonDecode(response.body));
    }
    throw Exception('Erreur creation consultation');
  }

  Future<void> updateConsultation(int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/medecin/consultations/$id'),
      headers: authService.authHeaders,
      body: jsonEncode(data),
    );
    if (response.statusCode != 200) throw Exception('Erreur mise a jour consultation');
  }

  Future<Prescription> addPrescription(int consultationId, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/medecin/consultations/$consultationId/prescriptions'),
      headers: authService.authHeaders,
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return Prescription.fromJson(jsonDecode(response.body));
    }
    throw Exception('Erreur ajout prescription');
  }

  Future<Map<String, dynamic>> getMedecinProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/medecin/profile'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Erreur chargement profil');
  }

  Future<void> updateMedecinProfile(Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/medecin/profile'),
      headers: authService.authHeaders,
      body: jsonEncode(data),
    );
    if (response.statusCode != 200) throw Exception('Erreur mise a jour profil');
  }

  Future<List<Disponibilite>> getMedecinDisponibilites() async {
    final response = await http.get(
      Uri.parse('$baseUrl/medecin/disponibilites'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Disponibilite.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement disponibilites');
  }

  Future<void> addDisponibilite(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/medecin/disponibilites'),
      headers: authService.authHeaders,
      body: jsonEncode(data),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Erreur ajout disponibilite');
    }
  }

  // ─── SECRETAIRE ───
  Future<List<Appointment>> getSecretaireAppointmentsByDate(String date) async {
    final response = await http.get(
      Uri.parse('$baseUrl/secretaire/appointments?date=$date'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Appointment.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement rendez-vous');
  }

  Future<List<Appointment>> getSecretaireAppointmentsBetween(String from, String to) async {
    final response = await http.get(
      Uri.parse('$baseUrl/secretaire/appointments?from=$from&to=$to'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Appointment.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement rendez-vous');
  }

  Future<Appointment> createSecretaireAppointment(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/secretaire/appointments'),
      headers: authService.authHeaders,
      body: jsonEncode(data),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return Appointment.fromJson(jsonDecode(response.body));
    }
    throw Exception('Erreur creation rendez-vous');
  }

  Future<void> confirmSecretaireAppointment(int id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/secretaire/appointments/$id/confirm'),
      headers: authService.authHeaders,
    );
    if (response.statusCode != 200) throw Exception('Erreur confirmation');
  }

  Future<void> cancelSecretaireAppointment(int id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/secretaire/appointments/$id/cancel'),
      headers: authService.authHeaders,
    );
    if (response.statusCode != 200) throw Exception('Erreur annulation');
  }

  Future<List<User>> getSecretairePatients() async {
    final response = await http.get(
      Uri.parse('$baseUrl/secretaire/patients'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => User.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement patients');
  }

  Future<List<User>> searchPatients(String query) async {
    final response = await http.get(
      Uri.parse('$baseUrl/secretaire/patients/search?query=$query'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => User.fromJson(json)).toList();
    }
    throw Exception('Erreur recherche patients');
  }

  Future<void> createPatientBySecretaire(Map<String, dynamic> data, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/secretaire/patients'),
      headers: authService.authHeaders,
      body: jsonEncode({...data, 'password': password}),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Erreur creation patient');
    }
  }

  Future<void> updatePatientBySecretaire(int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/secretaire/patients/$id'),
      headers: authService.authHeaders,
      body: jsonEncode(data),
    );
    if (response.statusCode != 200) throw Exception('Erreur mise a jour patient');
  }

  Future<List<Invoice>> getSecretaireInvoices() async {
    final response = await http.get(
      Uri.parse('$baseUrl/secretaire/invoices'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Invoice.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement factures');
  }

  Future<void> recordPayment(int invoiceId, double montant, String modePaiement) async {
    final response = await http.post(
      Uri.parse('$baseUrl/secretaire/invoices/$invoiceId/payment'),
      headers: authService.authHeaders,
      body: jsonEncode({'montant': montant, 'modePaiement': modePaiement}),
    );
    if (response.statusCode != 200) throw Exception('Erreur enregistrement paiement');
  }

  // ─── ADMIN ───
  Future<DashboardStats> getAdminDashboard() async {
    final response = await http.get(
      Uri.parse('$baseUrl/admin/dashboard'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      return DashboardStats.fromJson(jsonDecode(response.body));
    }
    throw Exception('Erreur chargement dashboard');
  }

  Future<List<User>> getAdminPatients() async {
    final response = await http.get(
      Uri.parse('$baseUrl/admin/patients'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => User.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement patients');
  }

  Future<List<Medecin>> getAdminMedecins() async {
    final response = await http.get(
      Uri.parse('$baseUrl/admin/medecins'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Medecin.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement medecins');
  }

  Future<void> createMedecin(Map<String, dynamic> data, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/admin/medecins'),
      headers: authService.authHeaders,
      body: jsonEncode({...data, 'password': password}),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Erreur creation medecin');
    }
  }

  Future<void> createSecretaire(Map<String, dynamic> data, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/admin/secretaires'),
      headers: authService.authHeaders,
      body: jsonEncode({...data, 'password': password}),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Erreur creation secretaire');
    }
  }

  Future<void> toggleUserStatus(int id, bool enabled) async {
    final response = await http.put(
      Uri.parse('$baseUrl/admin/users/$id/toggle-status'),
      headers: authService.authHeaders,
      body: jsonEncode({'enabled': enabled}),
    );
    if (response.statusCode != 200) throw Exception('Erreur changement statut');
  }

  Future<List<Invoice>> getAdminInvoices() async {
    final response = await http.get(
      Uri.parse('$baseUrl/admin/invoices'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Invoice.fromJson(json)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> getFinancialReport(String startDate, String endDate) async {
    final response = await http.get(
      Uri.parse('$baseUrl/admin/financial-report?startDate=$startDate&endDate=$endDate'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    return {};
  }

  Future<List<Map<String, dynamic>>> getAuditLogs() async {
    final response = await http.get(
      Uri.parse('$baseUrl/admin/audit-logs'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(jsonDecode(response.body));
    }
    return [];
  }

  Future<List<Appointment>> getAppointmentsByMedecinAndDate(int medecinId, String date) async {
    final response = await http.get(
      Uri.parse('$baseUrl/secretaire/appointments/medecin/$medecinId/date/$date'),
      headers: authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Appointment.fromJson(json)).toList();
    }
    throw Exception('Erreur chargement rendez-vous');
  }
}
