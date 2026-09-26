// lib/views/edit_profile_view.dart
import 'package:flutter/material.dart';

import '../models/user_profile_model.dart';

/// Screen 8 (Edit Profile):
/// Allows updating display name, handle, and creator bio.
class EditProfileView extends StatefulWidget {
  final UserProfileModel profile;

  const EditProfileView({
    super.key,
    required this.profile,
  });

  @override
  State<EditProfileView> createState() => _EditProfileViewState();
}

class _EditProfileViewState extends State<EditProfileView> {
  late TextEditingController _nameController;
  late TextEditingController _usernameController;
  late TextEditingController _bioController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.profile.displayName);
    _usernameController = TextEditingController(text: widget.profile.username);
    _bioController = TextEditingController(text: widget.profile.bio);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _usernameController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0B0E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0B0E),
        title: const Text('Edit Creator Profile'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: _nameController,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Display Name',
              labelStyle: TextStyle(color: Colors.white60),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _usernameController,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Username Handle (/profile/:username)',
              labelStyle: TextStyle(color: Colors.white60),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _bioController,
            maxLines: 3,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Creator Bio',
              labelStyle: TextStyle(color: Colors.white60),
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF59E0B),
              foregroundColor: Colors.black,
            ),
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Save Profile Changes'),
          ),
        ],
      ),
    );
  }
}
