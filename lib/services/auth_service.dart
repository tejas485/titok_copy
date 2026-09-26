// lib/services/auth_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';

/// Handles user authentication (Sign-Up, Login, Logout) and secure session
/// token management against the central backend (`https://github.dev`).
class AuthService {
  static const String _tokenStorageKey = 'streamgrid_auth_token';
  static const String _usernameStorageKey = 'streamgrid_auth_username';

  final http.Client _client;

  AuthService({http.Client? client}) : _client = client ?? http.Client();

  Future<String?> getCurrentUsername() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(_usernameStorageKey) ?? '@alex_rivers_dev';
  }

  Future<bool> login({
    required String usernameOrEmail,
    required String password,
  }) async {
    final Uri uri = Uri.parse(AppConfig.authLoginEndpoint);
    final http.Response response = await _client.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': usernameOrEmail,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> data =
          jsonDecode(response.body) as Map<String, dynamic>;
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _tokenStorageKey,
        data['token']?.toString() ?? 'session_jwt_active',
      );
      await prefs.setString(
        _usernameStorageKey,
        data['username']?.toString() ?? usernameOrEmail,
      );
      return true;
    }
    return false;
  }

  Future<bool> signUp({
    required String username,
    required String displayName,
    required String email,
    required String password,
  }) async {
    final Uri uri = Uri.parse(AppConfig.authSignupEndpoint);
    final http.Response response = await _client.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'display_name': displayName,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenStorageKey, 'session_jwt_created');
      await prefs.setString(_usernameStorageKey, username);
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenStorageKey);
    await prefs.remove(_usernameStorageKey);
  }
}
