// lib/models/video_item_model.dart
import '../config/app_config.dart';

class CreatorSummary {
  final String username;
  final String displayName;
  final String avatarUrl;
  final bool verified;

  const CreatorSummary({
    required this.username,
    required this.displayName,
    required this.avatarUrl,
    required this.verified,
  });

  factory CreatorSummary.fromJson(Map<String, dynamic> json) {
    return CreatorSummary(
      username: json['username']?.toString() ?? '@creator',
      displayName: json['display_name']?.toString() ?? 'Creator',
      avatarUrl: json['avatar_url']?.toString() ?? '',
      verified: json['verified'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
        'username': username,
        'display_name': displayName,
        'avatar_url': avatarUrl,
        'verified': verified,
      };
}

/// Model representing a single video element returned by `GET /feed`
/// and inside `GET /profile/:username`.
/// Directly maps the `stream_url` array element variable returned by `/feed`.
class VideoItemModel {
  final String videoId;
  final String caption;
  final String audioTrack;
  final String videoDriveId;
  final String streamUrl;
  final String coverUrl;
  final String duration;
  final int viewsCount;
  final int likesCount;
  final int commentsCount;
  final int sharesCount;
  final bool isLiked;
  final List<String> tags;
  final CreatorSummary creator;

  const VideoItemModel({
    required this.videoId,
    required this.caption,
    required this.audioTrack,
    required this.videoDriveId,
    required this.streamUrl,
    required this.coverUrl,
    required this.duration,
    required this.viewsCount,
    required this.likesCount,
    required this.commentsCount,
    required this.sharesCount,
    required this.isLiked,
    required this.tags,
    required this.creator,
  });

  factory VideoItemModel.fromJson(Map<String, dynamic> json) {
    final String driveId = json['video_drive_id']?.toString() ?? '';
    // Map directly to the `stream_url` array element variable returned by `/feed`
    // with fallback to AppConfig.centralPublicUrl stream path.
    final String rawStreamUrl = (json['stream_url'] != null &&
            json['stream_url'].toString().isNotEmpty)
        ? json['stream_url'].toString()
        : AppConfig.mediaStreamEndpoint(driveId);

    return VideoItemModel(
      videoId: json['video_id']?.toString() ?? '',
      caption: json['caption']?.toString() ?? '',
      audioTrack: json['audio_track']?.toString() ?? 'Original Audio',
      videoDriveId: driveId,
      streamUrl: rawStreamUrl,
      coverUrl: json['cover_url']?.toString() ?? '',
      duration: json['duration']?.toString() ?? '00:30',
      viewsCount: (json['views_count'] as num?)?.toInt() ?? 0,
      likesCount: (json['likes_count'] as num?)?.toInt() ?? 0,
      commentsCount: (json['comments_count'] as num?)?.toInt() ?? 0,
      sharesCount: (json['shares_count'] as num?)?.toInt() ?? 0,
      isLiked: json['is_liked'] == true,
      tags: (json['tags'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const <String>[],
      creator: CreatorSummary.fromJson(
        (json['creator'] as Map<String, dynamic>?) ?? const <String, dynamic>{},
      ),
    );
  }
}
