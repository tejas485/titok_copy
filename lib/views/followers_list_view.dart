// lib/views/followers_list_view.dart
import 'package:flutter/material.dart';

/// Screen 9 (Followers & Following List):
/// Displays follower relationships for a given creator handle.
class FollowersListView extends StatelessWidget {
  final String username;

  const FollowersListView({
    super.key,
    required this.username,
  });

  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> accounts = [
      {'handle': '@maya_shaders', 'name': 'Maya Lin • GLSL & Flutter'},
      {'handle': '@kaito_motion', 'name': 'Kaito Takahashi • 60fps UI'},
      {'handle': '@elena_rust', 'name': 'Elena Rostova • Media Pipelines'},
      {'handle': '@devon_dart', 'name': 'Devon Brooks • Dart VM Engineer'},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0A0B0E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0B0E),
        title: Text('$username Connections'),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: accounts.length,
        separatorBuilder: (_, __) => const Divider(color: Colors.white12),
        itemBuilder: (context, index) {
          final acc = accounts[index];
          return ListTile(
            leading: const CircleAvatar(
              backgroundColor: Color(0xFFF59E0B),
              child: Icon(Icons.person, color: Colors.black),
            ),
            title: Text(
              acc['handle']!,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            subtitle: Text(
              acc['name']!,
              style: const TextStyle(color: Colors.white60, fontSize: 12),
            ),
            trailing: OutlinedButton(
              onPressed: () {},
              child: const Text('Following'),
            ),
          );
        },
      ),
    );
  }
}
