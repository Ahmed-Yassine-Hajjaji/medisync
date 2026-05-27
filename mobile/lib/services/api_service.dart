import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import 'auth_service.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8080/api';
  final AuthService authService;

  ApiService(this.authService);

  Future<List<Medecin>> getMedecins() async {
    final response = await http.get(
      Uri.parse('$baseUrl/public/medecins'),
      headers: authService.authHeaders,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Medecin.fromJson(json)).toList();
    }
    throw Exception('Failed to load medecins');
  }

  Future<Medecin> getMedecinById(int id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/public/medecins/$id'),
      headers: authService.authHeaders,
    );

    if (response.statusCode == 200) {
      return Medecin.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to load medecin');
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
    throw Exception('Failed to load creneaux');
  }

  Future<List<Appointment>> getMyAppointments() async {
    final response = await http.get(
      Uri.parse('$baseUrl/patient/appointments'),
      headers: authService.authHeaders,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Appointment.fromJson(json)).toList();
    }
    throw Exception('Failed to load appointments');
  }

  Future<Appointment> createAppointment({
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

    if (response.statusCode == 200) {
      return Appointment.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to create appointment');
  }

  Future<void> cancelAppointment(int id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/patient/appointments/$id/cancel'),
      headers: authService.authHeaders,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to cancel appointment');
    }
  }
}
