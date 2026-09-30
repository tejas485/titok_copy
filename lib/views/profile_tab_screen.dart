// lib/views/profile_tab_screen.dart
import 'package:flutter/material.dart';

import '../main.dart';
import '../services/media_service.dart';

/// Master 10th Folder Profile Screen (`ProfileTabScreen`)
/// Queries `GetProfileData` via `MediaService.fetch10thProfileFolder()` for
/// `profile_10_all` (`master_creator_10` / "All Videos Portfolio Folder") and
/// renders the 3x3 `v1.mp4`..`v9.mp4` portfolio grid with `SliverPersistentHeader` tabs.
class ProfileTabScreen extends StatefulWidget {
  final ValueChanged<int>? onLaunchVideoIndex;
  final VoidCallback? onLogout;

  const ProfileTabScreen({
    super.key,
    this.onLaunchVideoIndex,
    this.onLogout,
  });

  @override
  State<ProfileTabScreen> createState() => _ProfileTabScreenState();
}

class _ProfileTabScreenState extends State<ProfileTabScreen> {
  final MediaService _mediaService = MediaService();
  Map<String, dynamic>? _profileData;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadMaster10thFolder();
  }

  /// Queries the gRPC service layer for the master portfolio data structure
  Future<void> _loadMaster10thFolder() async {
    try {
      final Map<String, dynamic> dataset =
          await _mediaService.fetch10thProfileFolder();
      if (!mounted) return;
      setState(() {
        _profileData = dataset;
        _isLoading = false;
        _errorMessage = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Failed to sync folder array: $e';
        _isLoading = false;
      });
    }
  }

  /// Resolves a valid raster/SVG image URL when `avatar_url` is bare `https://dicebear.com`
  String _resolveValidAvatarUrl(String? rawUrl) {
    if (rawUrl == null || rawUrl.trim().isEmpty) {
      return 'https://api.dicebear.com/7.x/bottts/png?seed=master_creator_10';
    }
    if (rawUrl.trim() == 'https://dicebear.com' ||
        rawUrl.trim() == 'https://dicebear.com/') {
      return 'https://api.dicebear.com/7.x/bottts/png?seed=master_creator_10';
    }
    return rawUrl;
  }

  void _openVideoFrom10thFolder(
    BuildContext context,
    String videoFileName,
    int videoIndex1Based,
  ) {
    debugPrint('🚀 Launching video target from 10th folder: $videoFileName');
    if (widget.onLaunchVideoIndex != null) {
      widget.onLaunchVideoIndex!(videoIndex1Based);
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => Scaffold(
          backgroundColor: Colors.black,
          body: Stack(
            children: [
              VideoPlayerItem(
                videoIndex: videoIndex1Based,
                token: 'eyJhbGciOiJIUzI1NiIsIn...',
                onAuthExpired: () {
                  debugPrint(
                    '🔄 Token invalidation event intercepted in 10th folder player.',
                  );
                },
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
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: CircularProgressIndicator(color: Colors.pinkAccent),
        ),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Text(
            _errorMessage!,
            style: const TextStyle(color: Colors.white, fontSize: 16),
          ),
        ),
      );
    }

    final List<String> videoList =
        (_profileData?['video_list'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            <String>[];
    final String resolvedAvatarUrl =
        _resolveValidAvatarUrl(_profileData?['avatar_url'] as String?);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text(
          (_profileData?['username'] as String?) ?? 'master_creator_10',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: 'Re-sync 10th Profile Folder via gRPC',
            icon: const Icon(Icons.sync, color: Colors.white70, size: 20),
            onPressed: () {
              setState(() => _isLoading = true);
              _loadMaster10thFolder();
            },
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: TextButton.icon(
              style: TextButton.styleFrom(
                backgroundColor: Colors.redAccent.withOpacity(0.18),
                foregroundColor: Colors.redAccent,
              ),
              onPressed: () {
                GrpcVideoEngine.instance.clearAuthAndBufferCache();
                widget.onLogout?.call();
              },
              icon: const Icon(Icons.logout_rounded, size: 18),
              label: const Text(
                'Log Out',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
      body: DefaultTabController(
        length: 2,
        child: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) {
            return [
              SliverToBoxAdapter(
                child: Column(
                  children: [
                    const SizedBox(height: 10),
                    // User Avatar Display Engine Frame
                    CircleAvatar(
                      radius: 46,
                      backgroundColor: Colors.grey[900],
                      backgroundImage: NetworkImage(resolvedAvatarUrl),
                      onBackgroundImageError: (_, __) {},
                    ),
                    const SizedBox(height: 12),
                    // Profile Display Name Marker Text
                    Text(
                      (_profileData?['display_name'] as String?) ??
                          'All Videos Portfolio Folder',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Metrics Tracker Layer Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildMetricColumn('${videoList.length}', 'Videos'),
                        _buildMetricSpacer(),
                        _buildMetricColumn('1.2M', 'Likes'),
                        _buildMetricSpacer(),
                        _buildMetricColumn('450K', 'Followers'),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Action Status Bar Indicator
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey[900],
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: Colors.grey[800]!),
                      ),
                      child: const Text(
                        'Synced with Server 10th Master Directory 📁',
                        style: TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
              SliverPersistentHeader(
                pinned: true,
                delegate: _SliverAppBarDelegate(
                  const TabBar(
                    indicatorColor: Colors.white,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.grey,
                    tabs: [
                      Tab(icon: Icon(Icons.grid_on)),
                      Tab(icon: Icon(Icons.favorite_border)),
                    ],
                  ),
                ),
              ),
            ];
          },
          body: TabBarView(
            children: [
              // Tab 1: The 3x3 Grid containing all 9 videos (v1.mp4 - v9.mp4)
              _buildMasterVideoGrid(context, videoList),
              // Tab 2: Liked Videos Placeholder
              const Center(
                child: Text(
                  'Liked Videos History Empty',
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricColumn(String count, String label) {
    return Column(
      children: [
        Text(
          count,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(color: Colors.grey, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildMetricSpacer() {
    return Container(
      height: 25,
      width: 1,
      color: Colors.grey[800],
      margin: const EdgeInsets.symmetric(horizontal: 24),
    );
  }

  Widget _buildMasterVideoGrid(BuildContext context, List<String> videoList) {
    if (videoList.isEmpty) {
      return const Center(
        child: Text(
          'No videos found in 10th directory',
          style: TextStyle(color: Colors.grey),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(2),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3, // 3 columns per row (TikTok standard)
        crossAxisSpacing: 2,
        mainAxisSpacing: 2,
        childAspectRatio: 0.75, // Vertical portrait thumbnail aspect ratio
      ),
      itemCount: videoList.length,
      itemBuilder: (context, index) {
        final String videoFileName = videoList[index];
        return GestureDetector(
          onTap: () => _openVideoFrom10thFolder(
            context,
            videoFileName,
            index + 1,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.grey[900],
              border: Border.all(color: Colors.black, width: 0.5),
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Center Thumbnail Play Icon
                const Center(
                  child: Icon(
                    Icons.play_circle_fill,
                    color: Colors.white30,
                    size: 36,
                  ),
                ),
                // Video Index Identifier Tag
                Positioned(
                  bottom: 6,
                  left: 6,
                  child: Row(
                    children: [
                      const Icon(
                        Icons.videocam,
                        color: Colors.white,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        videoFileName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          shadows: [
                            Shadow(blurRadius: 2, color: Colors.black),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                // Simulated View Count Tracker
                Positioned(
                  bottom: 6,
                  right: 6,
                  child: Row(
                    children: [
                      const Icon(
                        Icons.play_arrow,
                        color: Colors.white,
                        size: 12,
                      ),
                      Text(
                        '${(index + 1) * 12}K',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Helper class to lock the TabBar at the top while scrolling the grid
class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;

  _SliverAppBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;

  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(color: Colors.black, child: _tabBar);
  }

  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) => false;
}
