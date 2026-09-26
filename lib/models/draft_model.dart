// lib/models/draft_model.dart

class DraftModel {
  final String id;
  final String title;
  final String duration;
  final String updatedAt;
  final String coverUrl;
  final String resolution;
  final String sizeMb;

  const DraftModel({
    required this.id,
    required this.title,
    required this.duration,
    required this.updatedAt,
    required this.coverUrl,
    required this.resolution,
    required this.sizeMb,
  });

  factory DraftModel.fromJson(Map<String, dynamic> json) {
    return DraftModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Untitled Draft',
      duration: json['duration']?.toString() ?? '00:15',
      updatedAt: json['updated_at']?.toString() ?? 'Today',
      coverUrl: json['cover_url']?.toString() ?? '',
      resolution: json['resolution']?.toString() ?? '1080p 60fps',
      sizeMb: json['size_mb']?.toString() ?? '14.2 MB',
    );
  }
}
