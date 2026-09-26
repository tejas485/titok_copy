// lib/services/notification_service.dart
import 'dart:async';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class PushNotificationEvent {
  final String id;
  final String title;
  final String body;
  final String category; // 'new_content' | 'mention' | 'system'
  final DateTime timestamp;

  const PushNotificationEvent({
    required this.id,
    required this.title,
    required this.body,
    required this.category,
    required this.timestamp,
  });
}

/// Manages push notification listeners and local notification banners for
/// new video content, `@mentions`, and creator updates.
class NotificationService {
  NotificationService._internal();
  static final NotificationService instance = NotificationService._internal();

  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  final StreamController<PushNotificationEvent> _notificationStreamController =
      StreamController<PushNotificationEvent>.broadcast();

  Stream<PushNotificationEvent> get onNotificationReceived =>
      _notificationStreamController.stream;

  Future<void> initialize() async {
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings();
    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    await _localNotifications.initialize(initSettings);
  }

  Future<void> dispatchNotification({
    required String title,
    required String body,
    String category = 'mention',
  }) async {
    final event = PushNotificationEvent(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      body: body,
      category: category,
      timestamp: DateTime.now(),
    );
    _notificationStreamController.add(event);

    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'streamgrid_high_importance_channel',
      'StreamGrid Updates & Mentions',
      channelDescription:
          'Notifications for new creator content, comments, and @mentions.',
      importance: Importance.max,
      priority: Priority.high,
    );
    const NotificationDetails platformDetails =
        NotificationDetails(android: androidDetails);

    await _localNotifications.show(
      event.id.hashCode,
      title,
      body,
      platformDetails,
    );
  }

  void dispose() {
    _notificationStreamController.close();
  }
}
