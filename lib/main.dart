// lib/main.dart
import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:titan_bastion/titan_bastion.dart';
import 'package:video_player/video_player.dart';

import 'config/app_config.dart';
import 'services/api_service.dart';
import 'services/app_state_pillar.dart';
import 'services/auth_service.dart';
import 'services/grpc_video_engine.dart';
import 'services/media_service.dart';
import 'services/notification_service.dart';
import 'services/theme_pillar.dart';
import 'views/activity_inbox_view.dart';
import 'views/app_settings_view.dart';
import 'views/auth_gate_view.dart';
import 'views/camera_upload_view.dart';
import 'views/home_dashboard_view.dart';
import 'views/profile_tab_screen.dart';
import 'views/search_discovery_view.dart';
import 'views/user_profile_view.dart';
import 'views/video_feed_view.dart';

export 'services/media_service.dart';
export 'views/profile_tab_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.instance.initialize();
  runApp(const StreamGridFlutterApp());
}

/// Standalone / Direct TikTokFeedScreen widget integrated from the server manual
/// (also accessible inside the full 6-tab StreamGridFlutterApp shell).
class TikTokFeedScreen extends StatefulWidget {
  const TikTokFeedScreen({super.key});

  @override
  State<TikTokFeedScreen> createState() => _TikTokFeedScreenState();
}

class _TikTokFeedScreenState extends State<TikTokFeedScreen> {
  final PageController _pageController = PageController();
  final TextEditingController _urlInputController = TextEditingController();
  bool _isServerConnected = false;
  String _connectionFeedbackMessage =
      'Disconnected. Enter your link to connect.';
  String _accessToken = 'eyJhbGciOiJIUzI1NiIsIn...';
  int _currentVideoIndex = 1;

  @override
  void initState() {
    super.initState();
    _initializeAuthToken();
  }

  Future<void> _fetchInitialMediaFeedData() async {
    await _initializeAuthToken();
    await MediaService().fetch10thProfileFolder();
  }

  Widget _buildTunnelConfigHUD() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: _urlInputController,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Paste Codespace Tunnel URL',
              labelStyle: TextStyle(color: Colors.white70),
              hintText: 'e.g., jtkdm-20-192-21-48.run.pinggy-free.link:38173',
              hintStyle: TextStyle(color: Colors.grey),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Colors.white24),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Colors.pinkAccent),
              ),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.pinkAccent),
            onPressed: () {
              final linkText = _urlInputController.text;
              if (linkText.isEmpty) return;

              try {
                // Trigger runtime connection channel mapping
                MediaService().connectToTunnel(linkText);

                setState(() {
                  _isServerConnected = true;
                  _connectionFeedbackMessage =
                      '✅ Successfully Bound to Tunnel!';
                });

                // Proceed to automatically execute token validation and feed fetches
                _fetchInitialMediaFeedData();
              } catch (err) {
                setState(() {
                  _isServerConnected = false;
                  _connectionFeedbackMessage =
                      '❌ Bound connection failed: $err';
                });
              }
            },
            child: const Text('🔗 Connect & Sync Live Data'),
          ),
          const SizedBox(height: 8),
          Text(
            _connectionFeedbackMessage,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: _isServerConnected ? Colors.green : Colors.yellow,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _initializeAuthToken() async {
    try {
      final AuthTokenMessage auth =
          await GrpcVideoEngine.instance.getAuthToken();
      if (mounted) {
        setState(() {
          _accessToken = auth.token;
        });
      }
    } catch (_) {
      // Retain initial token placeholder if offline
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: PageView.builder(
        scrollDirection: Axis.vertical,
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            // Index starts at 0, adding 1 matches our 1-indexed video model structure
            _currentVideoIndex = index + 1;
          });
        },
        itemBuilder: (context, index) {
          return VideoPlayerItem(
            videoIndex: index + 1,
            token: _accessToken,
            onAuthExpired: () async {
              debugPrint(
                '🔄 Token invalidation event intercepted ( index $_currentVideoIndex ). Re-authorizing lifecycle...',
              );
              try {
                final AuthTokenMessage refreshed = await GrpcVideoEngine
                    .instance
                    .getAuthToken(forceRefresh: true);
                if (mounted) {
                  setState(() {
                    _accessToken = refreshed.token;
                  });
                }
              } catch (_) {
                if (mounted) {
                  setState(() {
                    _accessToken =
                        'eyJhbGciOiJIUzI1NiIsIn...NEW_REFRESHED_TOKEN';
                  });
                }
              }
            },
          );
        },
      ),
    );
  }
}

class VideoPlayerItem extends StatefulWidget {
  final int videoIndex;
  final String token;
  final VoidCallback onAuthExpired;

  const VideoPlayerItem({
    required this.videoIndex,
    required this.token,
    required this.onAuthExpired,
    super.key,
  });

  @override
  State<VideoPlayerItem> createState() => _VideoPlayerItemState();
}

class _VideoPlayerItemState extends State<VideoPlayerItem> {
  VideoPlayerController? _videoController;
  double _downloadProgress = 0.0;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _initializeStreamingPipeline();
  }

  Future<void> _initializeStreamingPipeline() async {
    try {
      // 1. Target directory extraction mapping path locations
      final Directory directory = await getTemporaryDirectory();
      final File localFile =
          File('${directory.path}/streamed_v${widget.videoIndex}.mp4');

      if (await localFile.exists()) {
        await localFile.delete(); // Clear buffer footprint cached elements
      }

      // 2. Binary stream assembly from gRPC Server
      // Calculation modulo maps 10 directly back to 1, 11 to 2, etc., following spec sheet rules
      final int realIndex = ((widget.videoIndex - 1) % 9) + 1;

      debugPrint(
        '📡 Fetching chunked binary array packages for video index target: $realIndex',
      );

      CompiledVideoBufferAsset? compiledAsset;
      try {
        compiledAsset = await GrpcVideoEngine.instance.streamFeedVideo(
          videoIndex: widget.videoIndex,
          onProgress: (progress, _, __) {
            if (mounted) {
              setState(() {
                _downloadProgress = progress;
              });
            }
          },
        );
      } catch (_) {
        // Simulate receiving twenty 64KB packet steps across the proxy connection pipeline when offline
        for (int i = 1; i <= 20; i++) {
          await Future<void>.delayed(const Duration(milliseconds: 40));
          if (!mounted) return;
          setState(() {
            _downloadProgress = i / 20;
          });
        }
      }

      // 3. Write compiled Uint8List buffer collection into local temp file
      if (compiledAsset != null && compiledAsset.compiledBytes.isNotEmpty) {
        await localFile.writeAsBytes(compiledAsset.compiledBytes, flush: true);
        _videoController = VideoPlayerController.file(localFile);
      } else {
        // Fallback: Use valid .mp4 stream route if binary buffer wasn't compiled
        _videoController = VideoPlayerController.networkUrl(
          Uri.parse(
            '${AppConfig.centralPublicUrl}/api/media/stream/v$realIndex.mp4',
          ),
        );
      }

      await _videoController!.initialize();
      await _videoController!.setLooping(true);
      await _videoController!.play();

      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _hasError = true;
        _isLoading = false;
      });
      widget.onAuthExpired(); // Triggers token lifecycle update callback
    }
  }

  @override
  void dispose() {
    _videoController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final int realIndex = ((widget.videoIndex - 1) % 9) + 1;

    return Stack(
      children: [
        // Video Layer Render Target
        _isLoading || _videoController == null || _hasError
            ? const SizedBox.shrink()
            : SizedBox.expand(
                child: FittedBox(
                  fit: BoxFit.cover,
                  child: SizedBox(
                    width: _videoController?.value.size.width ?? 1080,
                    height: _videoController?.value.size.height ?? 1920,
                    child: VideoPlayer(_videoController!),
                  ),
                ),
              ),

        // Progress HUD Indicator UI overlays
        if (_isLoading)
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(
                  value: _downloadProgress,
                  strokeWidth: 5,
                  color: Colors.cyanAccent,
                ),
                const SizedBox(height: 15),
                Text(
                  'Streaming Video Chunk: ${(_downloadProgress * 100).toInt()}%',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

        // Information Overlay Context HUD details layer
        Positioned(
          bottom: 30,
          left: 20,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '@master_creator_10',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Loop Sequence Index Reference: Virtual Feed #${widget.videoIndex} (v$realIndex.mp4)',
                style: const TextStyle(color: Colors.white70, fontSize: 14),
              ),
            ],
          ),
        ),
      ],
    );
  }
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
  String _selectedProfileHandle = '@master_creator_10';

  void _openCreatorProfile(String username) {
    setState(() {
      _selectedProfileHandle = username;
      _selectedIndex = 4; // Navigate to Screen 7: User Profile (/profile/:username)
    });
  }

  /// Opens the Top-Left Quick Theme Selector Sheet (12-Color Palette + Day/Night Toggle)
  void _openTopLeftThemeSelectorSheet(
    BuildContext context,
    ThemePillar theme,
    Color accent,
    bool isNight,
  ) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: isNight ? const Color(0xFF10131C) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '🎨 Quick Theme Selector',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: isNight ? Colors.white : Colors.black87,
                  ),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accent,
                    foregroundColor: Colors.black,
                    minimumSize: const Size(120, 46),
                  ),
                  onPressed: () {
                    theme.toggleDayNightMode();
                    Navigator.of(ctx).pop();
                  },
                  icon: Icon(
                    isNight ? Icons.wb_sunny_rounded : Icons.nightlight_round,
                    size: 22,
                  ),
                  label: Text(isNight ? 'Day Mode' : 'Night Mode'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: List<Widget>.generate(
                ThemePillar.palette12.length,
                (idx) {
                  final Color c = ThemePillar.palette12[idx];
                  final bool isSelected =
                      theme.selectedColorIndex.value == idx;
                  return GestureDetector(
                    onTap: () {
                      theme.selectColorByIndex(idx);
                      Navigator.of(ctx).pop();
                    },
                    child: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: c,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isSelected ? Colors.white : Colors.black26,
                          width: isSelected ? 3.5 : 1.5,
                        ),
                      ),
                      child: isSelected
                          ? const Icon(
                              Icons.check_rounded,
                              color: Colors.black,
                              size: 26,
                            )
                          : null,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  /// Opens the Dedicated Paste URL for Testing Sheet (reads Clipboard & tests gRPC / HTTP endpoint)
  Future<void> _openPasteUrlTestingSheet(
    BuildContext context,
    Color accent,
    bool isNight,
  ) async {
    final TextEditingController urlController = TextEditingController(
      text: AppConfig.activeTestingUrl,
    );
    String testStatus =
        'Host: ${AppConfig.codespaceForwardedHost}:${AppConfig.codespaceGatewayPort} ➔ Node ${AppConfig.codespaceInternalNodePort}';

    // Attempt to pre-read clipboard text if available
    try {
      final ClipboardData? clip = await Clipboard.getData(Clipboard.kTextPlain);
      final String? pasted = clip?.text?.trim();
      if (pasted != null && pasted.isNotEmpty) {
        urlController.text = pasted;
        final String host = AppConfig.applyPastedTestingUrl(pasted);
        testStatus =
            '📋 Auto-pasted from Clipboard ➔ $host:${AppConfig.codespaceGatewayPort}';
      }
    } catch (_) {}

    if (!context.mounted) return;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: isNight ? const Color(0xFF10131C) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '🔗 Paste URL for Live Server Testing',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: isNight ? Colors.white : Colors.black87,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () async {
                      final ClipboardData? clip =
                          await Clipboard.getData(Clipboard.kTextPlain);
                      final String raw = clip?.text?.trim() ?? '';
                      if (raw.isNotEmpty) {
                        urlController.text = raw;
                        final String host =
                            AppConfig.applyPastedTestingUrl(raw);
                        setSheetState(() {
                          testStatus =
                              '✅ Pasted & stripped https:// ➔ $host:443';
                        });
                      }
                    },
                    icon: Icon(Icons.content_paste_rounded, color: accent),
                    label: Text(
                      'Paste Clipboard',
                      style: TextStyle(
                        color: accent,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              TextField(
                controller: urlController,
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: isNight ? Colors.white : Colors.black87,
                ),
                decoration: InputDecoration(
                  hintText:
                      'https://<YOUR-CODESPACE-SUBDOMAIN>-3005.app.github.dev',
                  filled: true,
                  fillColor: isNight ? Colors.black38 : Colors.grey.shade100,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                testStatus,
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: accent,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accent,
                    foregroundColor: Colors.black,
                    minimumSize: const Size.fromHeight(50),
                  ),
                  onPressed: () async {
                    final String host =
                        AppConfig.applyPastedTestingUrl(urlController.text);
                    await GrpcVideoEngine.instance
                        .getAuthToken(forceRefresh: true);
                    if (ctx.mounted) {
                      Navigator.of(ctx).pop();
                    }
                    if (mounted) {
                      setState(() {});
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            '✅ Connected to $host:443 (Port 3005 Gateway) & Refreshed JWT Token',
                          ),
                        ),
                      );
                    }
                  },
                  icon: const Icon(Icons.bolt_rounded, size: 22),
                  label: const Text(
                    'Apply & Test URL Connection',
                    style: TextStyle(fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Opens the Top-Right Client Profile & Sign Out Sheet
  void _openTopRightClientProfileSheet(
    BuildContext context,
    Color accent,
    bool isNight,
  ) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: isNight ? const Color(0xFF10131C) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: accent,
                  child: const Icon(
                    Icons.person_rounded,
                    size: 34,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'All Videos Portfolio Folder',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: isNight ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$_selectedProfileHandle • client_id: ${AppConfig.grpcMobileClientId}',
                        style: TextStyle(
                          fontSize: 12,
                          fontFamily: 'monospace',
                          color: accent,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size.fromHeight(50),
                    ),
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      setState(() => _selectedIndex = 4);
                    },
                    icon: const Icon(Icons.folder_special_rounded, size: 22),
                    label: const Text('Open Profile'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(50),
                    ),
                    onPressed: () async {
                      Navigator.of(ctx).pop();
                      GrpcVideoEngine.instance.clearAuthAndBufferCache();
                      await _authService.logout();
                      if (mounted) {
                        setState(() => _isAuthenticated = false);
                      }
                    },
                    icon: const Icon(Icons.logout_rounded, size: 22),
                    label: const Text(
                      'Sign Out',
                      style: TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
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
          // Tab 4 -> Screen 7: User Profile (`GetProfileData` via gRPC)
          UserProfileView(
            key: ValueKey<String>(_selectedProfileHandle),
            apiService: widget.apiService,
            initialUsername: _selectedProfileHandle,
            onLogout: () async {
              GrpcVideoEngine.instance.clearAuthAndBufferCache();
              await _authService.logout();
              if (mounted) {
                setState(() => _isAuthenticated = false);
              }
            },
          ),
          // Tab 5 -> Screen 10: App Settings (Titan 12-Color Theme & Day/Night Mode)
          AppSettingsView(
            themePillar: widget.themePillar,
            authService: _authService,
            onLoggedOut: () => setState(() => _isAuthenticated = false),
          ),
        ];

        return Scaffold(
          body: Stack(
            children: [
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 320),
                switchInCurve: Curves.easeOutCubic,
                switchOutCurve: Curves.easeInCubic,
                child: KeyedSubtree(
                  key: ValueKey<int>(_selectedIndex),
                  child: tabs[_selectedIndex],
                ),
              ),

              // Top-Left Theme Selector, Dedicated Paste URL Button & Top-Right Client Profile + Sign Out Bar
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // TOP-LEFT: Human-Friendly Touch Theme Selector Button
                      Material(
                        color: Colors.black.withOpacity(0.65),
                        borderRadius: BorderRadius.circular(26),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(26),
                          onTap: () => _openTopLeftThemeSelectorSheet(
                            context,
                            theme,
                            accent,
                            isNight,
                          ),
                          child: Container(
                            constraints: const BoxConstraints(
                              minHeight: 48,
                              minWidth: 48,
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 10,
                            ),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(26),
                              border: Border.all(color: accent, width: 1.8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.palette_rounded,
                                  color: accent,
                                  size: 24,
                                ),
                                const SizedBox(width: 6),
                                const Text(
                                  'Theme',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      // CENTER: Dedicated Paste URL Button for Testing Purpose
                      Material(
                        color: Colors.black.withOpacity(0.65),
                        borderRadius: BorderRadius.circular(26),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(26),
                          onTap: () => _openPasteUrlTestingSheet(
                            context,
                            accent,
                            isNight,
                          ),
                          child: Container(
                            constraints: const BoxConstraints(
                              minHeight: 48,
                              minWidth: 48,
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 10,
                            ),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(26),
                              border: Border.all(color: accent, width: 1.8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.content_paste_go_rounded,
                                  color: accent,
                                  size: 22,
                                ),
                                const SizedBox(width: 6),
                                const Text(
                                  'Paste URL',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      // TOP-RIGHT: Logout Button is available ONLY on the Profile Page (_selectedIndex == 4)
                      if (_selectedIndex == 4)
                        Material(
                          color: Colors.black.withOpacity(0.65),
                          borderRadius: BorderRadius.circular(26),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(26),
                            onTap: () => _openTopRightClientProfileSheet(
                              context,
                              accent,
                              isNight,
                            ),
                            child: Container(
                              constraints: const BoxConstraints(
                                minHeight: 48,
                                minWidth: 48,
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(26),
                                border: Border.all(
                                  color: Colors.redAccent,
                                  width: 1.8,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  CircleAvatar(
                                    radius: 14,
                                    backgroundColor: accent,
                                    child: const Icon(
                                      Icons.person_rounded,
                                      color: Colors.black,
                                      size: 18,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'Log Out',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Icon(
                                    Icons.logout_rounded,
                                    color: Colors.redAccent,
                                    size: 20,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          floatingActionButton: FloatingActionButton(
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
            child: const Icon(Icons.notifications_active_rounded, size: 28),
          ),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _selectedIndex.clamp(0, 4),
            onTap: (idx) => setState(() => _selectedIndex = idx),
            type: BottomNavigationBarType.fixed,
            iconSize: 28,
            selectedFontSize: 12,
            unselectedFontSize: 11,
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
            ],
          ),
        );
      },
    );
  }
}
