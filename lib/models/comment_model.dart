// lib/models/comment_model.dart

class CommentModel {
  final String id;
  final String videoId;
  final String username;
  final String displayName;
  final String avatarUrl;
  final String text;
  final String createdAt;
  final int likesCount;
  final bool isLiked;

  const CommentModel({
    required this.id,
    required this.videoId,
    required this.username,
    required this.displayName,
    required this.avatarUrl,
    required this.text,
    required this.createdAt,
    required this.likesCount,
    required this.isLiked,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['id']?.toString() ?? '',
      videoId: json['video_id']?.toString() ?? '',
      username: json['username']?.toString() ?? '@user',
      displayName: json['display_name']?.toString() ?? 'User',
      avatarUrl: json['avatar_url']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
      createdAt: json['created_at']?.toString() ?? 'Just now',
      likesCount: (json['likes_count'] as num?)?.toInt() ?? 0,
      isLiked: json['is_liked'] == true,
    );
  }
}
