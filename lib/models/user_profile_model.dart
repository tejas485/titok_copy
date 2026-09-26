// lib/models/user_profile_model.dart
import '../config/app_config.dart';
import 'video_item_model.dart';

/// Aggregates creator metadata and the `videos` grid list returned by
/// `GET ${AppConfig.centralPublicUrl}/profile/:username`.
class UserProfileModel {
  final String id;
  final String username;
  final String displayName;
  final String bio;
  final String avatarUrl;
  final bool verified;
  final int followingCount;
  final int followersCount;
  final int likesCount;
  final bool isFollowing;
  final String endpointResolved;
  final List<VideoItemModel> videos;

  const UserProfileModel({
    required this.id,
    required this.username,
    required this.displayName,
    required this.bio,
    required this.avatarUrl,
    required this.verified,
    required this.followingCount,
    required this.followersCount,
    required this.likesCount,
    required this.isFollowing,
    required this.endpointResolved,
    required this.videos,
  });

  factory UserProfileModel.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> userMap =
        (json['user'] as Map<String, dynamic>?) ?? json;
    final List<dynamic> rawVideos =
        (json['videos'] as List<dynamic>?) ?? const <dynamic>[];
    final String uname = userMap['username']?.toString() ?? '@alex_rivers_dev';

    return UserProfileModel(
      id: userMap['id']?.toString() ?? 'u_1',
      username: uname,
      displayName: userMap['display_name']?.toString() ?? uname,
      bio: userMap['bio']?.toString() ?? '',
      avatarUrl: userMap['avatar_url']?.toString() ?? '',
      verified: userMap['verified'] == true,
      followingCount: (userMap['following_count'] as num?)?.toInt() ?? 0,
      followersCount: (userMap['followers_count'] as num?)?.toInt() ?? 0,
      likesCount: (userMap['likes_count'] as num?)?.toInt() ?? 0,
      isFollowing: userMap['is_following'] == true,
      endpointResolved: json['endpoint_resolved']?.toString() ??
          AppConfig.profileByUsernameEndpoint(uname),
      videos: rawVideos
          .map((item) => VideoItemModel.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}
