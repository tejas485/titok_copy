// lib/main.dart
import 'package:flutter/material.dart';
import 'package:titan_bastion/titan_bastion.dart';

import 'config/app_config.dart';
import 'services/api_service.dart';
import 'services/app_state_pillar.dart';
import 'services/auth_service.dart';
import 'services/notification_service.dart';
import 'services/theme_pillar.dart';
import 'views/activity_inbox_view.dart';
import 'views/app_settings_view.dart';
import 'views/auth_gate_view.dart';
import 'views/camera_upload_view.dart';
import 'views/home_dashboard_view.dart';
import 'views/search_discovery_view.dart';
import 'views/user_profile_view.dart';
import 'views/video_feed_view.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.instance.initialize();
  runApp(const StreamGridFlutterApp());
}

class StreamGridFlutterApp extends StatefulWidget {
  const StreamGridFlutterApp({super.key});

  @override
  State<StreamGridFlutterApp> createState() => _StreamGridFlutterAppState();
}

class _StreamGridFlutterAppState extends State<StreamGridFlutterApp> {
  final ApiService _apiService = ApiService();
  late final ThemePillar _themePillar = ThemePillar();
  late final AppStatePillar _appStatePillar =
      AppStatePillar(apiService: _apiService);

  @override
  void dispose() {
    _themePillar.dispose();
    _appStatePillar.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Beacon(
      pillars: [_themePillar, _appStatePillar],
      child: Vestige<ThemePillar>(
        pillar: _themePillar,
        builder: (context, theme) {
          final ThemeData activeTheme = theme.buildThemeData();
          return AnimatedTheme(
            data: activeTheme,
            duration: const Duration(milliseconds: 380),
            curve: Curves.easeOutCubic,
            child: MaterialApp(
              title: 'StreamGrid (${AppConfig.centralPublicUrl})',
              debugShowCheckedModeBanner: false,
              theme: activeTheme,
              home: MainNavigationShell(
                apiService: _apiService,
                themePillar: _themePillar,
                appStatePillar: _appStatePillar,
              ),
            ),
          );
        },
      ),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  final ApiService apiService;
  final ThemePillar themePillar;
  final AppStatePillar appStatePillar;

  const MainNavigationShell({
    super.key,
    required this.apiService,
    required this.themePillar,
    required this.appStatePillar,
  });

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  final AuthService _authService = AuthService();

  bool _isAuthenticated = true;
  int _selectedIndex = 1; // Defaults to Screen 2: Video Feed (/feed -> stream_url)
  int _feedInitialIndex = 0;
  String _selectedProfileHandle = '@alex_rivers_dev';

  void _openCreatorProfile(String username) {
    setState(() {
      _selectedProfileHandle = username;
      _selectedIndex = 4; // Navigate to Screen 7: User Profile (/profile/:username)
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_isAuthenticated) {
      return AuthGateView(
        authService: _authService,
        onAuthenticated: () => setState(() => _isAuthenticated = true),
      );
    }

    return Vestige<ThemePillar>(
      pillar: widget.themePillar,
      builder: (context, theme) {
        final Color accent = theme.primaryAccent.value;
        final bool isNight = theme.isNightMode.value;

        final List<Widget> tabs = <Widget>[
          // Tab 0 -> Screen 1: Home Dashboard
          HomeDashboardView(
            apiService: widget.apiService,
            onOpenFeedIndex: (index) {
              setState(() {
                _feedInitialIndex = index;
                _selectedIndex = 1;
              });
            },
            onOpenCreatorProfile: _openCreatorProfile,
          ),
          // Tab 1 -> Screen 2: Video Feed (maps directly to `stream_url` from `/feed`)
          VideoFeedView(
            key: ValueKey<int>(_feedInitialIndex),
            apiService: widget.apiService,
            themePillar: widget.themePillar,
            appStatePillar: widget.appStatePillar,
            initialIndex: _feedInitialIndex,
            onSelectCreatorProfile: _openCreatorProfile,
          ),
          // Tab 2 -> Screen 3: Camera & Multipart Upload (`/upload`)
          CameraUploadView(
            apiService: widget.apiService,
            onUploadSuccess: () => setState(() => _selectedIndex = 1),
          ),
          // Tab 3 -> Screen 5: Search & Discovery
          SearchDiscoveryView(
            apiService: widget.apiService,
            onSelectCreator: _openCreatorProfile,
          ),
          // Tab 4 -> Screen 7: User Profile (`/profile/:username` data loops)
          UserProfileView(
            key: ValueKey<String>(_selectedProfileHandle),
            apiService: widget.apiService,
            initialUsername: _selectedProfileHandle,
          ),
          // Tab 5 -> Screen 10: App Settings (Titan 12-Color Theme & Day/Night Mode)
          AppSettingsView(
            themePillar: widget.themePillar,
            authService: _authService,
            onLoggedOut: () => setState(() => _isAuthenticated = false),
          ),
        ];

        return Scaffold(
          body: AnimatedSwitcher(
            duration: const Duration(milliseconds: 320),
            switchInCurve: Curves.easeOutCubic,
            switchOutCurve: Curves.easeInCubic,
            child: KeyedSubtree(
              key: ValueKey<int>(_selectedIndex),
              child: tabs[_selectedIndex],
            ),
          ),
          floatingActionButton: FloatingActionButton.small(
            backgroundColor: accent,
            foregroundColor: Colors.black,
            tooltip: 'Activity & Notifications',
            onPressed: () {
              Navigator.of(context).push(
                PageRouteBuilder<void>(
                  pageBuilder: (_, animation, __) => FadeTransition(
                    opacity: animation,
                    child: const ActivityInboxView(),
                  ),
                ),
              );
            },
            child: const Icon(Icons.notifications_active_rounded),
          ),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _selectedIndex,
            onTap: (idx) => setState(() => _selectedIndex = idx),
            type: BottomNavigationBarType.fixed,
            backgroundColor:
                isNight ? const Color(0xFF090A0F) : const Color(0xFFFFFFFF),
            selectedItemColor: accent,
            unselectedItemColor: isNight ? Colors.white54 : Colors.black54,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.dashboard_rounded),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.play_circle_fill),
                label: 'Feed',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.add_box_rounded),
                label: 'Upload',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.search_rounded),
                label: 'Search',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person_rounded),
                label: 'Profile',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.palette_rounded),
                label: 'Theme',
              ),
            ],
          ),
        );
      },
    );
  }
}
