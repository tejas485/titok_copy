// lib/views/user_profile_view.dart
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../models/user_profile_model.dart';
import '../models/video_item_model.dart';
import '../services/api_service.dart';
import '../services/app_state_pillar.dart';
import '../services/grpc_video_engine.dart';
import '../services/theme_pillar.dart';
import 'creator_analytics_view.dart';
import 'edit_profile_view.dart';
import 'followers_list_view.dart';
import 'profile_tab_screen.dart';
import 'video_drafts_view.dart';
import 'video_feed_view.dart';

/// Screen 7 (User Profile) & gRPC Profile Collection API (`GetProfileData`):
/// - Supports `GetProfileData({ token: YOUR_JWT_ACCESS_TOKEN, profile_id: "profile_10_all" })`
///   returning `username: "master_creator_10"`, `display_name: "All Videos Portfolio Folder"`,
///   `avatar_url: "https://dicebear.com"`, and `video_list: ["v1.mp4" .. "v9.mp4"]`.
/// - Clicking the profile photo opens the image in full-screen with pinch-to-zoom.
/// - Clicking any video in the 9-video portfolio grid opens the looping gRPC
///   `StreamFeedVideo` player at that `video_index` (1..9).
class UserProfileView extends StatefulWidget {
  final ApiService apiService;
  final ThemePillar? themePillar;
  final AppStatePillar? appStatePillar;
  final String initialUsername;
  final VoidCallback? onLogout;

  const UserProfileView({
    super.key,
    required this.apiService,
    this.themePillar,
    this.appStatePillar,
    this.initialUsername = '@master_creator_10',
    this.onLogout,
  });

  @override
  State<UserProfileView> createState() => _UserProfileViewState();
}

class _UserProfileViewState extends State<UserProfileView> {
  late String _activeUsername;
  late Future<UserProfileModel> _profileFuture;
  bool _showMaster10thFolderScreen = true;

  static const List<String> _loopHandles = <String>[
    '@master_creator_10',
    '@alex_rivers_dev',
    '@maya_shaders',
    '@kaito_motion',
  ];

  @override
  void initState() {
    super.initState();
    _activeUsername = widget.initialUsername;
    _showMaster10thFolderScreen =
        _activeUsername.contains('master_creator_10') ||
            _activeUsername.contains('profile_10_all');
    _loadProfileLoop(_activeUsername);
  }

  void _loadProfileLoop(String username) {
    setState(() {
      _activeUsername = username;
      _showMaster10thFolderScreen =
          username.contains('master_creator_10') ||
              username.contains('profile_10_all');
      _profileFuture = widget.apiService.fetchProfileByUsername(username);
    });
  }

  /// Opens the creator's profile photo in a full-screen interactive modal
  void _openFullScreenProfilePhoto(
    BuildContext context,
    UserProfileModel profile,
    Color accent,
  ) {
    showDialog<void>(
      context: context,
      barrierColor: Colors.black.withOpacity(0.92),
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: Stack(
          alignment: Alignment.center,
          children: [
            InteractiveViewer(
              minScale: 0.8,
              maxScale: 4.0,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Image.asset(
                  'src/assets/images/creator_avatar_alex_1790420981846.jpg',
                  width: 320,
                  height: 320,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 280,
                    height: 280,
                    color: accent,
                    child: const Icon(
                      Icons.person,
                      size: 120,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 0,
              right: 0,
              child: IconButton(
                onPressed: () => Navigator.of(ctx).pop(),
                icon: const CircleAvatar(
                  backgroundColor: Colors.white24,
                  child: Icon(Icons.close, color: Colors.white),
                ),
              ),
            ),
            Positioned(
              bottom: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: accent),
                ),
                child: Text(
                  '${profile.displayName} (${profile.username})',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Opens the clicked profile video in full-screen looping playback mode
  void _openProfileVideoPlayer(BuildContext context, int videoIndex) {
    final themePillar = widget.themePillar ?? ThemePillar();
    final appStatePillar =
        widget.appStatePillar ?? AppStatePillar(apiService: widget.apiService);

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => Scaffold(
          backgroundColor: Colors.black,
          body: Stack(
            children: [
              VideoFeedView(
                apiService: widget.apiService,
                themePillar: themePillar,
                appStatePillar: appStatePillar,
                initialIndex: videoIndex,
              ),
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: CircleAvatar(
                    backgroundColor: Colors.black54,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_showMaster10thFolderScreen) {
      return Stack(
        children: [
          ProfileTabScreen(
            onLaunchVideoIndex: (videoIndex1Based) {
              _openProfileVideoPlayer(context, videoIndex1Based - 1);
            },
            onLogout: widget.onLogout,
          ),
          SafeArea(
            child: Align(
              alignment: Alignment.topLeft,
              child: Padding(
                padding: const EdgeInsets.only(left: 8, top: 4),
                child: PopupMenuButton<String>(
                  tooltip: 'Switch Profile Dataset',
                  icon: const Icon(
                    Icons.swap_horiz,
                    color: Colors.pinkAccent,
                  ),
                  onSelected: _loadProfileLoop,
                  itemBuilder: (context) => _loopHandles
                      .map(
                        (handle) => PopupMenuItem<String>(
                          value: handle,
                          child: Text(
                            handle == '@master_creator_10'
                                ? '10th Folder (profile_10_all)'
                                : 'Fetch /profile/$handle',
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
            ),
          ),
        ],
      );
    }

    final ThemeData theme = Theme.of(context);
    final Color accent = theme.colorScheme.primary;
    final Color onSurface = theme.colorScheme.onSurface;
    final Color cardColor = theme.cardColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
        title: Text(
          _activeUsername,
          style: TextStyle(
            color: onSurface,
            fontWeight: FontWeight.w800,
            fontSize: 16,
          ),
        ),
        actions: [
          PopupMenuButton<String>(
            icon: Icon(Icons.swap_horiz, color: accent),
            onSelected: _loadProfileLoop,
            itemBuilder: (context) => _loopHandles
                .map(
                  (handle) => PopupMenuItem<String>(
                    value: handle,
                    child: Text('Fetch /profile/$handle'),
                  ),
                )
                .toList(),
          ),
          IconButton(
            tooltip: 'Creator Analytics',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const CreatorAnalyticsView(),
                ),
              );
            },
            icon: Icon(Icons.bar_chart, color: onSurface.withOpacity(0.75)),
          ),
        ],
      ),
      body: FutureBuilder<UserProfileModel>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(
              child: CircularProgressIndicator(color: accent),
            );
          }

          if (snapshot.hasError || !snapshot.hasData) {
            return Center(
              child: Text(
                'Error loading ${AppConfig.profileByUsernameEndpoint(_activeUsername)}:\n${snapshot.error}',
                textAlign: TextAlign.center,
                style: TextStyle(color: onSurface.withOpacity(0.75)),
              ),
            );
          }

          final UserProfileModel profile = snapshot.data!;

          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      // Tappable Profile Photo -> Opens Full Screen Image Modal
                      GestureDetector(
                        onTap: () => _openFullScreenProfilePhoto(
                          context,
                          profile,
                          accent,
                        ),
                        child: Stack(
                          alignment: Alignment.bottomRight,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(3),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: accent, width: 2.5),
                              ),
                              child: ClipOval(
                                child: Image.asset(
                                  'src/assets/images/creator_avatar_alex_1790420981846.jpg',
                                  width: 84,
                                  height: 84,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => CircleAvatar(
                                    radius: 42,
                                    backgroundColor: accent,
                                    child: const Icon(
                                      Icons.person,
                                      size: 42,
                                      color: Colors.black,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            CircleAvatar(
                              radius: 13,
                              backgroundColor: accent,
                              child: const Icon(
                                Icons.fullscreen,
                                size: 16,
                                color: Colors.black,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        profile.displayName,
                        style: TextStyle(
                          color: onSurface,
                          fontWeight: FontWeight.w800,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        AppConfig.profileByUsernameEndpoint(profile.username),
                        style: TextStyle(
                          color: accent,
                          fontSize: 11,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        profile.bio,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: onSurface.withOpacity(0.75),
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _ProfileMetric(
                            label: 'Following',
                            value: '${profile.followingCount}',
                            textColor: onSurface,
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute<void>(
                                  builder: (_) => FollowersListView(
                                    username: profile.username,
                                  ),
                                ),
                              );
                            },
                          ),
                          _ProfileMetric(
                            label: 'Followers',
                            value: '${profile.followersCount}',
                            textColor: onSurface,
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute<void>(
                                  builder: (_) => FollowersListView(
                                    username: profile.username,
                                  ),
                                ),
                              );
                            },
                          ),
                          _ProfileMetric(
                            label: 'Likes',
                            value: '${profile.likesCount}',
                            textColor: onSurface,
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          OutlinedButton(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute<void>(
                                  builder: (_) => EditProfileView(
                                    profile: profile,
                                  ),
                                ),
                              );
                            },
                            child: const Text('Edit Profile'),
                          ),
                          const SizedBox(width: 10),
                          OutlinedButton(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute<void>(
                                  builder: (_) => VideoDraftsView(
                                    apiService: widget.apiService,
                                  ),
                                ),
                              );
                            },
                            child: const Text('Video Drafts'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // 3-Column Uploaded Reels Grid returned by `/profile/:username`
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    mainAxisSpacing: 6,
                    crossAxisSpacing: 6,
                    childAspectRatio: 0.72,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final VideoItemModel video = profile.videos[index];
                      return GestureDetector(
                        onTap: () => _openProfileVideoPlayer(context, index),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 280),
                          decoration: BoxDecoration(
                            color: cardColor,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: accent.withOpacity(0.28),
                            ),
                          ),
                          padding: const EdgeInsets.all(8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 5,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.black54,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      video.duration,
                                      style: TextStyle(
                                        color: accent,
                                        fontSize: 9,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                  ),
                                  Icon(
                                    Icons.play_circle_fill,
                                    color: accent,
                                    size: 18,
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    video.caption,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: onSurface,
                                      fontSize: 10,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${video.likesCount} likes',
                                    style: TextStyle(
                                      color: accent,
                                      fontSize: 10,
                                      fontFamily: 'monospace',
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                    childCount: profile.videos.length,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ProfileMetric extends StatelessWidget {
  final String label;
  final String value;
  final Color textColor;
  final VoidCallback? onTap;

  const _ProfileMetric({
    required this.label,
    required this.value,
    required this.textColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.w800,
              fontSize: 16,
              fontFamily: 'monospace',
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(color: textColor.withOpacity(0.6), fontSize: 11),
          ),
        ],
      ),
    );
  }
}
