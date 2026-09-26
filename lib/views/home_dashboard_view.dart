// lib/views/home_dashboard_view.dart
import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../models/video_item_model.dart';
import '../services/api_service.dart';

/// Screen 1: Home Dashboard View
/// Adapts dynamically to Day/Night mode and 12-Color Titan Theme via [Theme.of(context)].
class HomeDashboardView extends StatefulWidget {
  final ApiService apiService;
  final ValueChanged<int>? onOpenFeedIndex;
  final ValueChanged<String>? onOpenCreatorProfile;

  const HomeDashboardView({
    super.key,
    required this.apiService,
    this.onOpenFeedIndex,
    this.onOpenCreatorProfile,
  });

  @override
  State<HomeDashboardView> createState() => _HomeDashboardViewState();
}

class _HomeDashboardViewState extends State<HomeDashboardView> {
  late Future<List<VideoItemModel>> _feedFuture;

  @override
  void initState() {
    super.initState();
    _feedFuture = widget.apiService.fetchVideoFeed();
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
          'StreamGrid',
          style: TextStyle(
            color: onSurface,
            fontWeight: FontWeight.w800,
            fontSize: 20,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: cardColor,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: accent.withOpacity(0.4)),
            ),
            child: Center(
              child: Text(
                AppConfig.centralPublicUrl,
                style: TextStyle(
                  color: accent,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
      body: FutureBuilder<List<VideoItemModel>>(
        future: _feedFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(
              child: CircularProgressIndicator(color: accent),
            );
          }

          final List<VideoItemModel> videos = snapshot.data ?? const [];

          return RefreshIndicator(
            color: accent,
            onRefresh: () async {
              setState(() {
                _feedFuture = widget.apiService.fetchVideoFeed();
              });
            },
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  'ACTIVE CREATORS',
                  style: TextStyle(
                    color: onSurface.withOpacity(0.6),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.1,
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 86,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      '@alex_rivers_dev',
                      '@maya_shaders',
                      '@kaito_motion',
                    ].map((handle) {
                      return GestureDetector(
                        onTap: () => widget.onOpenCreatorProfile?.call(handle),
                        child: Container(
                          margin: const EdgeInsets.only(right: 14),
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(2.5),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(color: accent, width: 2),
                                ),
                                child: CircleAvatar(
                                  radius: 26,
                                  backgroundColor: cardColor,
                                  child: Icon(Icons.person, color: accent),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                handle,
                                style: TextStyle(
                                  color: onSurface.withOpacity(0.8),
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'LIVE STREAM_URL FEED GRID',
                  style: TextStyle(
                    color: onSurface.withOpacity(0.6),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.1,
                  ),
                ),
                const SizedBox(height: 12),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: videos.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.72,
                  ),
                  itemBuilder: (context, index) {
                    final video = videos[index];
                    return GestureDetector(
                      onTap: () => widget.onOpenFeedIndex?.call(index),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 280),
                        decoration: BoxDecoration(
                          color: cardColor,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: onSurface.withOpacity(0.1)),
                        ),
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: accent.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    video.duration,
                                    style: TextStyle(
                                      color: accent,
                                      fontSize: 10,
                                      fontFamily: 'monospace',
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Icon(
                                  Icons.play_circle_fill,
                                  color: accent,
                                  size: 22,
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  video.creator.username,
                                  style: TextStyle(
                                    color: accent,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  video.caption,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: onSurface,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  video.streamUrl,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: onSurface.withOpacity(0.5),
                                    fontSize: 9,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
