import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class AuthService extends ChangeNotifier {
  static const String baseUrl = 'https://excluding-skipper-masculine.ngrok-free.dev/api';
  User? _user;
  bool _isLoading = true;

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get token => _user?.token;

  AuthService() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user');
    if (userData != null) {
      _user = User.fromJson(jsonDecode(userData));
    }
    _isLoading = false;
    notifyListeners();
  }

  /// Returns true if login succeeded, throws '2FA_REQUIRED' if TOTP is needed.
  Future<bool> login(String email, String password, {String? totpCode}) async {
    try {
      final body = <String, dynamic>{'email': email, 'password': password};
      if (totpCode != null && totpCode.isNotEmpty) {
        body['totpCode'] = totpCode;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true'},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (data['requiresTwoFactor'] == true) {
          throw Exception('2FA_REQUIRED');
        }

        _user = User.fromJson(data);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(data));

        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      if (e is Exception && e.toString().contains('2FA_REQUIRED')) rethrow;
      debugPrint('Login error: $e');
      return false;
    }
  }

  Future<bool> loginWithGoogle(String token) async {
    try {
      _user = null;
      final response = await http.get(
        Uri.parse('$baseUrl/auth/google/mobile?token=$token'),
        headers: {'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _user = User.fromJson(data);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(data));

        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Google login error: $e');
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String nom,
    required String prenom,
    String? telephone,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'nom': nom,
          'prenom': prenom,
          'telephone': telephone,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        _user = User.fromJson(data);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(data));

        notifyListeners();
        return true;
      }
      final body = response.body;
      String msg = 'Erreur inscription';
      try {
        final err = jsonDecode(body);
        msg = err['message'] ?? err['error'] ?? msg;
      } catch (_) {}
      throw Exception(msg);
    } catch (e) {
      if (e is Exception) rethrow;
      debugPrint('Register error: $e');
      throw Exception('Erreur de connexion au serveur');
    }
  }

  Future<void> logout() async {
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user');
    notifyListeners();
  }

  Map<String, String> get authHeaders => {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    if (token != null) 'Authorization': 'Bearer $token',
  };
}
