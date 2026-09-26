// lib/views/user_profile_view.dart
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../models/user_profile_model.dart';
import '../models/video_item_model.dart';
import '../services/api_service.dart';
import 'creator_analytics_view.dart';
import 'edit_profile_view.dart';
import 'followers_list_view.dart';
import 'video_drafts_view.dart';

/// Screen 7 (User Profile):
/// Configured to append usernames to `${AppConfig.centralPublicUrl}/profile/:username`
/// to fetch matching creator metadata and video grid data loops.
/// Supports both Day Mode and Night Mode via [Theme.of(context)].
class UserProfileView extends StatefulWidget {
  final ApiService apiService;
  final String initialUsername;

  const UserProfileView({
    super.key,
    required this.apiService,
    this.initialUsername = '@alex_rivers_dev',
  });

  @override
  State<UserProfileView> createState() => _UserProfileViewState();
}

class _UserProfileViewState extends State<UserProfileView> {
  late String _activeUsername;
  late Future<UserProfileModel> _profileFuture;

  static const List<String> _loopHandles = <String>[
    '@alex_rivers_dev',
    '@maya_shaders',
    '@kaito_motion',
  ];

  @override
  void initState() {
    super.initState();
    _activeUsername = widget.initialUsername;
    _loadProfileLoop(_activeUsername);
  }

  void _loadProfileLoop(String username) {
    setState(() {
      _activeUsername = username;
      _profileFuture = widget.apiService.fetchProfileByUsername(username);
    });
  }

  @override
  Widget build(BuildContext context) {
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
                      CircleAvatar(
                        radius: 40,
                        backgroundColor: accent,
                        child: const Icon(
                          Icons.person,
                          size: 40,
                          color: Colors.black,
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

              // 3-Column Video Grid Loop returned by `/profile/:username`
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
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 280),
                        decoration: BoxDecoration(
                          color: cardColor,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: onSurface.withOpacity(0.1),
                          ),
                        ),
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Align(
                              alignment: Alignment.topRight,
                              child: Icon(
                                Icons.play_arrow_rounded,
                                color: accent,
                                size: 18,
                              ),
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
                                  '${video.viewsCount} views',
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
