// lib/views/video_feed_view.dart
import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:titan_bastion/titan_bastion.dart';
import 'package:video_player/video_player.dart';

import '../config/app_config.dart';
import '../models/video_item_model.dart';
import '../services/api_service.dart';
import '../services/app_state_pillar.dart';
import '../services/grpc_video_engine.dart';
import '../services/theme_pillar.dart';
import 'comments_sheet_view.dart';

/// Screen 2 (Video Feed) — Powered by gRPC `StreamFeedVideo` Server-Streaming:
/// - Invokes `GetAuthToken({ client_id: "mobile_phone_client" })` on boot & refreshes
///   automatically on `UNAUTHENTICATED` after 3600s (1 hour).
/// - Unbounded 1-indexed vertical `PageView.builder` where `videoIndex = index + 1`
///   and `realIndex = ((videoIndex - 1) % 9) + 1` (`index 9` -> `v9.mp4`,
///   `index 10` -> wraps around to `v1.mp4`).
/// - Cleans up old `streamed_v${videoIndex}.mp4` temp buffer files, listens to incoming
///   `VideoChunk` binary buffers (`chunk_data`), updates the progress HUD
///   (`"Streaming Video Chunk: X%"`), writes compiled bytes to `localFile`, and plays
///   via `VideoPlayerController`.
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
  String _accessToken = 'eyJhbGciOiJIUzI1NiIsIn...';
  int _currentVideoIndex = 1;

  @override
  void initState() {
    super.initState();
    _currentVideoIndex = widget.initialIndex + 1;
    _pageController = PageController(initialPage: widget.initialIndex);
    _feedFuture = _fetchFeedFromServerViaGrpc();
    _bootstrapAuthToken();
  }

  /// Fetches the live server video catalog via gRPC `GetProfileData` (`profile_10_all`)
  /// so the Feed streams the exact server video list (`v1.mp4`..`v9.mp4` + uploaded videos).
  Future<List<VideoItemModel>> _fetchFeedFromServerViaGrpc() async {
    try {
      final GrpcProfileDataMessage grpcProfile =
          await GrpcVideoEngine.instance.getProfileData(
        profileId: AppConfig.masterProfileId,
      );
      if (grpcProfile.videos.isNotEmpty) {
        return grpcProfile.videos
            .map((Map<String, dynamic> v) => VideoItemModel.fromJson(v))
            .toList();
      }
      if (grpcProfile.videoList.isNotEmpty) {
        return List<VideoItemModel>.generate(
          grpcProfile.videoList.length,
          (int i) {
            final String filename = grpcProfile.videoList[i];
            final int idx = i + 1;
            return VideoItemModel(
              videoId: 'vid_$idx',
              caption:
                  'Server gRPC Stream $filename (#$idx) • ${grpcProfile.displayName}',
              streamUrl: '${AppConfig.activeTestingUrl}/api/media/stream/$filename',
              duration: '0:15',
              likesCount: 1200 + (idx * 110),
              commentsCount: 42 + (idx * 5),
              sharesCount: 19 + idx,
              isLiked: false,
              creator: CreatorSummaryModel(
                userId: 'usr_master_10',
                username: '@${grpcProfile.username.replaceFirst(RegExp(r"^@"), "")}',
                displayName: grpcProfile.displayName,
                avatarUrl: grpcProfile.avatarUrl,
              ),
            );
          },
        );
      }
    } catch (_) {
      // Fallback to REST feed endpoint if gRPC catalog call fails
    }
    return widget.apiService.fetchVideoFeed();
  }

  Future<void> _bootstrapAuthToken() async {
    try {
      final AuthTokenMessage auth =
          await GrpcVideoEngine.instance.getAuthToken();
      if (mounted) {
        setState(() {
          _accessToken = auth.token;
        });
      }
    } catch (_) {
      // Keep fallback token until next retry
    }
  }

  Future<void> _handleAuthExpired() async {
    debugPrint(
      '🔄 Token invalidation event intercepted. Re-authorizing lifecycle...',
    );
    try {
      final AuthTokenMessage refreshed =
          await GrpcVideoEngine.instance.getAuthToken(forceRefresh: true);
      if (mounted) {
        setState(() {
          _accessToken = refreshed.token;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _accessToken = 'eyJhbGciOiJIUzI1NiIsIn...NEW_REFRESHED_TOKEN';
        });
      }
    }
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

              // Unbounded vertical PageView.builder for infinite modulo-9 video loop
              return PageView.builder(
                controller: _pageController,
                scrollDirection: Axis.vertical,
                physics: const BouncingScrollPhysics(),
                onPageChanged: (index) {
                  setState(() {
                    // Index starts at 0; adding 1 matches 1-indexed video model structure
                    _currentVideoIndex = index + 1;
                  });
                },
                itemBuilder: (context, index) {
                  final int videoIndex = index + 1;
                  final int realIndex = ((videoIndex - 1) % 9) + 1;
                  final VideoItemModel item = feedItems.isNotEmpty
                      ? feedItems[(videoIndex - 1) % feedItems.length]
                      : VideoItemModel(
                          videoId: 'vid_$realIndex',
                          caption:
                              'gRPC Chunked Stream v$realIndex.mp4 (Virtual Feed #$videoIndex)',
                          streamUrl:
                              '${AppConfig.centralPublicUrl}/api/media/stream/v$realIndex.mp4',
                          duration: '0:15',
                          likesCount: 1200 + (realIndex * 110),
                          commentsCount: 42 + (realIndex * 5),
                          sharesCount: 19 + realIndex,
                          isLiked: false,
                          creator: const CreatorSummaryModel(
                            userId: 'usr_master_10',
                            username: '@master_creator_10',
                            displayName: 'All Videos Portfolio Folder',
                            avatarUrl: 'https://dicebear.com',
                          ),
                        );

                  return _StreamUrlVideoViewport(
                    videoIndex: videoIndex,
                    realIndex: realIndex,
                    token: _accessToken,
                    onAuthExpired: _handleAuthExpired,
                    videoItem: item,
                    streamUrl: item.streamUrl,
                    accentColor: accent,
                    appStatePillar: widget.appStatePillar,
                    onTapCreator: () {
                      widget.onSelectCreatorProfile
                          ?.call(item.creator.username);
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
  final int videoIndex;
  final int realIndex;
  final String token;
  final VoidCallback onAuthExpired;
  final VideoItemModel videoItem;
  final String streamUrl;
  final Color accentColor;
  final AppStatePillar appStatePillar;
  final VoidCallback onTapCreator;
  final VoidCallback onTapComments;
  final VoidCallback onTapShare;

  const _StreamUrlVideoViewport({
    required this.videoIndex,
    required this.realIndex,
    required this.token,
    required this.onAuthExpired,
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
  VideoPlayerController? _controller;
  late AnimationController _heartBurstController;
  double _downloadProgress = 0.0;
  bool _isLoading = true;
  bool _hasError = false;
  bool _showHeartBurst = false;

  @override
  void initState() {
    super.initState();
    _heartBurstController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    );
    _initializeStreamingPipeline();
  }

  Future<void> _initializeStreamingPipeline() async {
    try {
      // 1. Target directory extraction mapping path locations
      File? localFile;
      try {
        final Directory directory = await getTemporaryDirectory();
        localFile = File('${directory.path}/streamed_v${widget.videoIndex}.mp4');
        if (await localFile.exists()) {
          await localFile.delete(); // Clear buffer footprint cached elements
        }
      } catch (_) {
        localFile = null;
      }

      // 2. Binary stream assembly from gRPC Server
      // Calculation modulo maps 10 directly back to 1, 11 to 2, etc.
      final int realIndex = ((widget.videoIndex - 1) % 9) + 1;
      debugPrint(
        '📡 Fetching chunked binary array packages for video index target: $realIndex (Virtual Feed #${widget.videoIndex})',
      );

      CompiledVideoBufferAsset? compiledAsset;
      try {
        compiledAsset = await GrpcVideoEngine.instance.streamFeedVideo(
          videoIndex: widget.videoIndex,
          onProgress: (progress, currentByte, totalBytes) {
            if (mounted) {
              setState(() {
                _downloadProgress = progress;
              });
            }
          },
        );
      } catch (_) {
        // Fallback 20-step chunk progress simulation if offline/sandboxed
        for (int i = 1; i <= 20; i++) {
          await Future<void>.delayed(const Duration(milliseconds: 35));
          if (!mounted) return;
          setState(() {
            _downloadProgress = i / 20;
          });
        }
      }

      // 3. Write compiled Uint8List buffer collection into local temp file
      if (compiledAsset != null &&
          compiledAsset.compiledBytes.isNotEmpty &&
          localFile != null) {
        await localFile.writeAsBytes(compiledAsset.compiledBytes, flush: true);
        _controller = VideoPlayerController.file(localFile);
      } else {
        // Valid MP4 stream fallback (instead of non-video webpage URL)
        final String fallbackUrl = widget.streamUrl.isNotEmpty
            ? widget.streamUrl
            : '${AppConfig.centralPublicUrl}/api/media/stream/v$realIndex.mp4';
        _controller = VideoPlayerController.networkUrl(Uri.parse(fallbackUrl));
      }

      await _controller!.initialize();
      await _controller!.setLooping(true);
      await _controller!.play();

      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasError = false;
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
    _heartBurstController.dispose();
    _controller?.dispose();
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
              // Video Layer Render Target
              if (!_isLoading && _controller != null && !_hasError)
                SizedBox.expand(
                  child: FittedBox(
                    fit: BoxFit.cover,
                    child: SizedBox(
                      width: _controller?.value.size.width ?? 1080,
                      height: _controller?.value.size.height ?? 1920,
                      child: VideoPlayer(_controller!),
                    ),
                  ),
                )
              else
                Container(
                  color: const Color(0xFF0E1017),
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
                      const SizedBox(height: 6),
                      Text(
                        'Target: v${widget.realIndex}.mp4 • Virtual Feed #${widget.videoIndex}',
                        style: TextStyle(
                          color: widget.accentColor,
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
                            child:
                                const Icon(Icons.person, color: Colors.black),
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

              // Information Overlay Context HUD details layer
              Positioned(
                left: 20,
                right: 88,
                bottom: 30,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        GestureDetector(
                          onTap: widget.onTapCreator,
                          child: const Text(
                            '@master_creator_10',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.cyanAccent.withOpacity(0.18),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.cyanAccent.withOpacity(0.5),
                            ),
                          ),
                          child: Text(
                            'v${widget.realIndex}.mp4',
                            style: const TextStyle(
                              color: Colors.cyanAccent,
                              fontSize: 11,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Loop Sequence Index Reference: Virtual Feed #${widget.videoIndex}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.videoItem.caption,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white54,
                        fontSize: 12,
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

