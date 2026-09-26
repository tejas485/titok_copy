// lib/views/auth_gate_view.dart
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../services/auth_service.dart';

class AuthGateView extends StatefulWidget {
  final AuthService authService;
  final VoidCallback onAuthenticated;

  const AuthGateView({
    super.key,
    required this.authService,
    required this.onAuthenticated,
  });

  @override
  State<AuthGateView> createState() => _AuthGateViewState();
}

class _AuthGateViewState extends State<AuthGateView> {
  final TextEditingController _usernameController =
      TextEditingController(text: '@alex_rivers_dev');
  final TextEditingController _emailController =
      TextEditingController(text: 'alex@streamgrid.dev');
  final TextEditingController _passwordController =
      TextEditingController(text: '••••••••••••');
  bool _isSignUp = false;
  bool _loading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    if (_isSignUp) {
      await widget.authService.signUp(
        username: _usernameController.text.trim(),
        displayName: 'Alex Rivers',
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
    } else {
      await widget.authService.login(
        usernameOrEmail: _usernameController.text.trim(),
        password: _passwordController.text,
      );
    }
    if (mounted) {
      setState(() => _loading = false);
      widget.onAuthenticated();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0B0E),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(
                Icons.play_circle_fill,
                color: Color(0xFFF59E0B),
                size: 56,
              ),
              const SizedBox(height: 12),
              Text(
                _isSignUp ? 'Create StreamGrid Account' : 'Sign In to StreamGrid',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Connected to ${AppConfig.centralPublicUrl}',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFFF59E0B),
                  fontSize: 12,
                  fontFamily: 'monospace',
                ),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: _usernameController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Username Handle',
                  labelStyle: TextStyle(color: Colors.white60),
                ),
              ),
              if (_isSignUp) ...[
                const SizedBox(height: 14),
                TextField(
                  controller: _emailController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Email Address',
                    labelStyle: TextStyle(color: Colors.white60),
                  ),
                ),
              ],
              const SizedBox(height: 14),
              TextField(
                controller: _passwordController,
                obscureText: true,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Password',
                  labelStyle: TextStyle(color: Colors.white60),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF59E0B),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                ),
                onPressed: _loading ? null : _submit,
                child: Text(
                  _isSignUp ? 'Create Account' : 'Sign In',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              TextButton(
                onPressed: () => setState(() => _isSignUp = !_isSignUp),
                child: Text(
                  _isSignUp
                      ? 'Already have an account? Sign In'
                      : 'Need an account? Sign Up',
                  style: const TextStyle(color: Colors.white70),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
