// lib/views/activity_inbox_view.dart
import 'package:flutter/material.dart';

import '../services/notification_service.dart';

/// Screen 6 (Activity & Notifications Inbox):
/// Listens to [NotificationService] for real-time mentions, likes, and new uploads.
class ActivityInboxView extends StatelessWidget {
  const ActivityInboxView({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> defaultEvents = [
      {
        'actor': '@maya_shaders',
        'action': 'mentioned you in a comment: "Clean 60fps PageView loop!"',
        'time': '2m ago',
      },
      {
        'actor': '@kaito_motion',
        'action': 'liked your video streamed via /media/stream/drv_101',
        'time': '14m ago',
      },
      {
        'actor': '@elena_rust',
        'action': 'started following your creator profile',
        'time': '1h ago',
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0A0B0E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0B0E),
        title: const Text(
          'Activity & Mentions',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
        ),
        actions: [
          TextButton.icon(
            onPressed: () {
              NotificationService.instance.dispatchNotification(
                title: 'New Mention from @maya_shaders',
                body: 'Check out the new stream_url video pipeline!',
              );
            },
            icon: const Icon(
              Icons.notifications_active,
              color: Color(0xFFF59E0B),
              size: 18,
            ),
            label: const Text(
              'Test Push',
              style: TextStyle(color: Color(0xFFF59E0B), fontSize: 12),
            ),
          ),
        ],
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: defaultEvents.length,
        separatorBuilder: (_, __) => const Divider(color: Colors.white12),
        itemBuilder: (context, index) {
          final item = defaultEvents[index];
          return ListTile(
            leading: const CircleAvatar(
              backgroundColor: Color(0xFF1A1E2E),
              child: Icon(Icons.alternate_email, color: Color(0xFFF59E0B)),
            ),
            title: Text(
              item['actor']!,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
            subtitle: Text(
              item['action']!,
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            trailing: Text(
              item['time']!,
              style: const TextStyle(color: Colors.white38, fontSize: 11),
            ),
          );
        },
      ),
    );
  }
}
