// lib/services/app_state_pillar.dart
import 'package:titan/titan.dart';

import '../models/video_item_model.dart';
import 'api_service.dart';

/// Titan Pillar managing social interactions (Like, Follow/Unfollow, Share count,
/// Bookmark, and Preloaded Feed Cache) for fast, 60fps performance across devices.
class AppStatePillar extends Pillar {
  final ApiService apiService;

  AppStatePillar({required this.apiService});

  late final Core<List<VideoItemModel>> feedVideos =
      core<List<VideoItemModel>>(<VideoItemModel>[]);
  late final Core<Set<String>> likedVideoIds = core<Set<String>>(<String>{});
  late final Core<Set<String>> followedCreators = core<Set<String>>(<String>{
    '@maya_shaders',
  });
  late final Core<Map<String, int>> shareCounts =
      core<Map<String, int>>(<String, int>{});
  late final Core<bool> isLoadingFeed = core<bool>(false);

  Future<void> refreshFeed() async {
    strike(() => isLoadingFeed.value = true);
    try {
      final List<VideoItemModel> items = await apiService.fetchVideoFeed();
      strike(() {
        feedVideos.value = items;
        isLoadingFeed.value = false;
      });
    } catch (_) {
      strike(() => isLoadingFeed.value = false);
    }
  }

  bool isVideoLiked(String videoId) => likedVideoIds.value.contains(videoId);

  void toggleLike(String videoId) => strike(() {
        final Set<String> updated = Set<String>.from(likedVideoIds.value);
        if (updated.contains(videoId)) {
          updated.remove(videoId);
        } else {
          updated.add(videoId);
        }
        likedVideoIds.value = updated;
      });

  bool isFollowingCreator(String username) {
    final normalized =
        username.startsWith('@') ? username : '@${username.trim()}';
    return followedCreators.value.contains(normalized);
  }

  void toggleFollowCreator(String username) => strike(() {
        final normalized =
            username.startsWith('@') ? username : '@${username.trim()}';
        final Set<String> updated = Set<String>.from(followedCreators.value);
        if (updated.contains(normalized)) {
          updated.remove(normalized);
        } else {
          updated.add(normalized);
        }
        followedCreators.value = updated;
      });

  void recordShare(String videoId) => strike(() {
        final Map<String, int> updated =
            Map<String, int>.from(shareCounts.value);
        updated[videoId] = (updated[videoId] ?? 0) + 1;
        shareCounts.value = updated;
      });
}
