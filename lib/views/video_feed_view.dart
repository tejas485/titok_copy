// lib/views/video_feed_view.dart
import 'package:flutter/material.dart';
import 'package:titan_bastion/titan_bastion.dart';
import 'package:video_player/video_player.dart';

import '../config/app_config.dart';
import '../models/video_item_model.dart';
import '../services/api_service.dart';
import '../services/app_state_pillar.dart';
import '../services/theme_pillar.dart';
import 'comments_sheet_view.dart';

/// Screen 2 (Video Feed):
/// Maps its media items directly to the `stream_url` array element variable
/// returned by `${AppConfig.centralPublicUrl}/feed`.
/// Features smooth Titan reactive state for Likes, Follow/Unfollow, Comments,
/// Share bottom sheet, and double-tap heart burst animations.
class VideoFeedView extends StatefulWidget {
  final ApiService apiService;
  final ThemePillar themePillar;
  final AppStatePillar appStatePillar;
  final int initialIndex;
  final ValueChanged<String>? onSelectCreatorProfile;

  const VideoFeedView({
    super.key,
    required this.apiService,
    required this.themePillar,
    required this.appStatePillar,
    this.initialIndex = 0,
    this.onSelectCreatorProfile,
  });

  @override
  State<VideoFeedView> createState() => _VideoFeedViewState();
}

class _VideoFeedViewState extends State<VideoFeedView> {
  late Future<List<VideoItemModel>> _feedFuture;
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: widget.initialIndex);
    _feedFuture = widget.apiService.fetchVideoFeed();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _openCommentsModal(BuildContext context, VideoItemModel item) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CommentsSheetView(
        apiService: widget.apiService,
        videoItem: item,
      ),
    );
  }

  void _openShareSheet(
    BuildContext context,
    VideoItemModel item,
    Color accentColor,
  ) {
    widget.appStatePillar.recordShare(item.videoId);
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF141722),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Share Video (${item.creator.username})',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Direct stream_url: ${item.streamUrl}',
              style: TextStyle(
                color: accentColor,
                fontSize: 11,
                fontFamily: 'monospace',
              ),
            ),
            const SizedBox(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _ShareTargetButton(
                  icon: Icons.link_rounded,
                  label: 'Copy Link',
                  accentColor: accentColor,
                  onTap: () => Navigator.of(ctx).pop(),
                ),
                _ShareTargetButton(
                  icon: Icons.send_rounded,
                  label: 'Direct Msg',
                  accentColor: accentColor,
                  onTap: () => Navigator.of(ctx).pop(),
                ),
                _ShareTargetButton(
                  icon: Icons.qr_code_rounded,
                  label: 'QR Card',
                  accentColor: accentColor,
                  onTap: () => Navigator.of(ctx).pop(),
                ),
                _ShareTargetButton(
                  icon: Icons.download_rounded,
                  label: 'Save MP4',
                  accentColor: accentColor,
                  onTap: () => Navigator.of(ctx).pop(),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Vestige<ThemePillar>(
      pillar: widget.themePillar,
      builder: (context, theme) {
        final Color accent = theme.primaryAccent.value;

        return Scaffold(
          backgroundColor: Colors.black,
          body: FutureBuilder<List<VideoItemModel>>(
            future: _feedFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Center(
                  child: CircularProgressIndicator(color: accent),
                );
              }

              final List<VideoItemModel> feedItems = snapshot.data ?? const [];

              return PageView.builder(
                controller: _pageController,
                scrollDirection: Axis.vertical,
                physics: const BouncingScrollPhysics(),
                itemCount: feedItems.length,
                itemBuilder: (context, index) {
                  final VideoItemModel item = feedItems[index];
                  // Directly pass the `stream_url` array element variable returned by `/feed`
                  return _StreamUrlVideoViewport(
                    videoItem: item,
                    streamUrl: item.streamUrl,
                    accentColor: accent,
                    appStatePillar: widget.appStatePillar,
                    onTapCreator: () {
                      widget.onSelectCreatorProfile?.call(item.creator.username);
                    },
                    onTapComments: () => _openCommentsModal(context, item),
                    onTapShare: () => _openShareSheet(context, item, accent),
                  );
                },
              );
            },
          ),
        );
      },
    );
  }
}

class _StreamUrlVideoViewport extends StatefulWidget {
  final VideoItemModel videoItem;
  final String streamUrl;
  final Color accentColor;
  final AppStatePillar appStatePillar;
  final VoidCallback onTapCreator;
  final VoidCallback onTapComments;
  final VoidCallback onTapShare;

  const _StreamUrlVideoViewport({
    required this.videoItem,
    required this.streamUrl,
    required this.accentColor,
    required this.appStatePillar,
    required this.onTapCreator,
    required this.onTapComments,
    required this.onTapShare,
  });

  @override
  State<_StreamUrlVideoViewport> createState() =>
      _StreamUrlVideoViewportState();
}

class _StreamUrlVideoViewportState extends State<_StreamUrlVideoViewport>
    with SingleTickerProviderStateMixin {
  late VideoPlayerController _controller;
  late AnimationController _heartBurstController;
  bool _initialized = false;
  bool _showHeartBurst = false;

  @override
  void initState() {
    super.initState();
    _heartBurstController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    );
    // Bind directly to `stream_url` from `/feed` array element
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.streamUrl))
      ..initialize().then((_) {
        if (mounted) {
          setState(() => _initialized = true);
          _controller.setLooping(true);
          _controller.play();
        }
      }).catchError((_) {
        if (mounted) {
          setState(() => _initialized = false);
        }
      });
  }

  @override
  void dispose() {
    _heartBurstController.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _triggerDoubleTapLike() {
    if (!widget.appStatePillar.isVideoLiked(widget.videoItem.videoId)) {
      widget.appStatePillar.toggleLike(widget.videoItem.videoId);
    }
    setState(() => _showHeartBurst = true);
    _heartBurstController.forward(from: 0).then((_) {
      if (mounted) setState(() => _showHeartBurst = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Vestige<AppStatePillar>(
      pillar: widget.appStatePillar,
      builder: (context, appState) {
        final bool isLiked =
            appState.isVideoLiked(widget.videoItem.videoId) ||
                widget.videoItem.isLiked;
        final bool isFollowing =
            appState.isFollowingCreator(widget.videoItem.creator.username);
        final int extraShares =
            appState.shareCounts.value[widget.videoItem.videoId] ?? 0;

        return GestureDetector(
          onDoubleTap: _triggerDoubleTapLike,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Video stream viewport bound to `stream_url`
              if (_initialized)
                FittedBox(
                  fit: BoxFit.cover,
                  child: SizedBox(
                    width: _controller.value.size.width,
                    height: _controller.value.size.height,
                    child: VideoPlayer(_controller),
                  ),
                )
              else
                Container(
                  color: const Color(0xFF0E1017),
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.play_circle_outline,
                        color: widget.accentColor,
                        size: 58,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'stream_url: ${widget.streamUrl}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white60,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                ),

              // Double-tap heart burst animation overlay
              if (_showHeartBurst)
                Center(
                  child: ScaleTransition(
                    scale: CurvedAnimation(
                      parent: _heartBurstController,
                      curve: Curves.elasticOut,
                    ),
                    child: Icon(
                      Icons.favorite_rounded,
                      color: widget.accentColor,
                      size: 112,
                    ),
                  ),
                ),

              // Right-hand interaction rail with Follow/Unfollow, Like, Comment, Share
              Positioned(
                right: 16,
                bottom: 110,
                child: Column(
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      alignment: Alignment.bottomCenter,
                      children: [
                        GestureDetector(
                          onTap: widget.onTapCreator,
                          child: CircleAvatar(
                            radius: 24,
                            backgroundColor: widget.accentColor,
                            child: const Icon(Icons.person, color: Colors.black),
                          ),
                        ),
                        Positioned(
                          bottom: -8,
                          child: GestureDetector(
                            onTap: () => appState.toggleFollowCreator(
                              widget.videoItem.creator.username,
                            ),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              padding: const EdgeInsets.all(3),
                              decoration: BoxDecoration(
                                color: isFollowing
                                    ? const Color(0xFF10B981)
                                    : widget.accentColor,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                isFollowing ? Icons.check : Icons.add,
                                size: 13,
                                color: Colors.black,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    IconButton(
                      onPressed: () =>
                          appState.toggleLike(widget.videoItem.videoId),
                      icon: AnimatedScale(
                        scale: isLiked ? 1.18 : 1.0,
                        duration: const Duration(milliseconds: 220),
                        child: Icon(
                          Icons.favorite_rounded,
                          color: isLiked ? widget.accentColor : Colors.white,
                          size: 32,
                        ),
                      ),
                    ),
                    Text(
                      '${widget.videoItem.likesCount + (isLiked ? 1 : 0)}',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                    const SizedBox(height: 14),
                    IconButton(
                      onPressed: widget.onTapComments,
                      icon: const Icon(
                        Icons.chat_bubble_rounded,
                        color: Colors.white,
                        size: 30,
                      ),
                    ),
                    Text(
                      '${widget.videoItem.commentsCount}',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                    const SizedBox(height: 14),
                    IconButton(
                      onPressed: widget.onTapShare,
                      icon: const Icon(
                        Icons.reply_rounded,
                        color: Colors.white,
                        size: 30,
                      ),
                    ),
                    Text(
                      '${widget.videoItem.sharesCount + extraShares}',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ],
                ),
              ),

              // Bottom-left creator metadata & stream_url readout
              Positioned(
                left: 16,
                right: 88,
                bottom: 28,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        GestureDetector(
                          onTap: widget.onTapCreator,
                          child: Text(
                            widget.videoItem.creator.username,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: () => appState.toggleFollowCreator(
                            widget.videoItem.creator.username,
                          ),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 240),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: isFollowing
                                  ? Colors.white12
                                  : widget.accentColor,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              isFollowing ? 'Following' : 'Follow',
                              style: TextStyle(
                                color:
                                    isFollowing ? Colors.white : Colors.black,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      widget.videoItem.caption,
                      style:
                          const TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'stream_url: ${widget.streamUrl}',
                      style: TextStyle(
                        color: widget.accentColor,
                        fontSize: 11,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ShareTargetButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color accentColor;
  final VoidCallback onTap;

  const _ShareTargetButton({
    required this.icon,
    required this.label,
    required this.accentColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: accentColor.withOpacity(0.16),
            child: Icon(icon, color: accentColor),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(color: Colors.white70, fontSize: 11),
          ),
        ],
      ),
    );
  }
}
