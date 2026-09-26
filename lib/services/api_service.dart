// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/comment_model.dart';
import '../models/draft_model.dart';
import '../models/user_profile_model.dart';
import '../models/video_item_model.dart';

/// Central API client targeting the live cloud container at [AppConfig.centralPublicUrl]
/// (`https://github.dev`).
class ApiService {
  final http.Client _client;

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  /// Screen 2 (Video Feed): Fetches the video feed from `${AppConfig.centralPublicUrl}/feed`
  /// and maps each media item directly to the `stream_url` array element variable.
  Future<List<VideoItemModel>> fetchVideoFeed() async {
    final Uri uri = Uri.parse(AppConfig.feedEndpoint);
    final http.Response response = await _client.get(
      uri,
      headers: const {'Accept': 'application/json'},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load /feed (${response.statusCode})');
    }

    final dynamic decoded = jsonDecode(response.body);
    final List<dynamic> feedList = decoded is List<dynamic>
        ? decoded
        : ((decoded as Map<String, dynamic>)['feed'] as List<dynamic>? ??
            const <dynamic>[]);

    return feedList
        .map((item) => VideoItemModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Screen 7 (User Profile): Appends `:username` to `${AppConfig.centralPublicUrl}/profile/:username`
  /// to fetch matching creator metadata and video grid data loops.
  Future<UserProfileModel> fetchProfileByUsername(String username) async {
    final Uri uri = Uri.parse(AppConfig.profileByUsernameEndpoint(username));
    final http.Response response = await _client.get(
      uri,
      headers: const {'Accept': 'application/json'},
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Failed to load /profile/$username (${response.statusCode})',
      );
    }

    final Map<String, dynamic> decoded =
        jsonDecode(response.body) as Map<String, dynamic>;
    return UserProfileModel.fromJson(decoded);
  }

  /// Screen 3 (Camera & Upload): Multipart POST to `${AppConfig.centralPublicUrl}/upload`
  Future<VideoItemModel> uploadVideo({
    required String filePath,
    required String caption,
    required String username,
    String audioTrack = 'Original Sound - Studio Upload',
  }) async {
    final Uri uri = Uri.parse(AppConfig.uploadEndpoint);
    final http.MultipartRequest request = http.MultipartRequest('POST', uri)
      ..fields['caption'] = caption
      ..fields['username'] = username
      ..fields['audio_track'] = audioTrack;

    if (filePath.isNotEmpty) {
      request.files.add(await http.MultipartFile.fromPath('video', filePath));
    }

    final http.StreamedResponse streamedResponse = await request.send();
    final http.Response response =
        await http.Response.fromStream(streamedResponse);

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Upload failed (${response.statusCode})');
    }

    final Map<String, dynamic> decoded =
        jsonDecode(response.body) as Map<String, dynamic>;
    final Map<String, dynamic> videoJson =
        (decoded['video'] as Map<String, dynamic>?) ?? decoded;
    return VideoItemModel.fromJson(videoJson);
  }

  /// Screen 4 (Comments Sheet): Fetch comments for a video
  Future<List<CommentModel>> fetchComments(String videoId) async {
    final Uri uri = Uri.parse(AppConfig.commentsEndpoint(videoId));
    final http.Response response = await _client.get(uri);

    if (response.statusCode != 200) {
      throw Exception('Failed to fetch comments (${response.statusCode})');
    }

    final Map<String, dynamic> decoded =
        jsonDecode(response.body) as Map<String, dynamic>;
    final List<dynamic> list =
        (decoded['comments'] as List<dynamic>?) ?? const <dynamic>[];
    return list
        .map((e) => CommentModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Screen 4 (Comments Sheet): Post a new comment
  Future<CommentModel> postComment({
    required String videoId,
    required String username,
    required String text,
  }) async {
    final Uri uri = Uri.parse(AppConfig.commentsEndpoint(videoId));
    final http.Response response = await _client.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'text': text,
      }),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to post comment (${response.statusCode})');
    }

    final Map<String, dynamic> decoded =
        jsonDecode(response.body) as Map<String, dynamic>;
    return CommentModel.fromJson(
      (decoded['comment'] as Map<String, dynamic>?) ?? decoded,
    );
  }

  /// Screen 12 (Video Drafts): Fetch saved creator drafts
  Future<List<DraftModel>> fetchDrafts() async {
    final Uri uri = Uri.parse(AppConfig.draftsEndpoint);
    final http.Response response = await _client.get(uri);

    if (response.statusCode != 200) {
      throw Exception('Failed to fetch drafts (${response.statusCode})');
    }

    final Map<String, dynamic> decoded =
        jsonDecode(response.body) as Map<String, dynamic>;
    final List<dynamic> list =
        (decoded['drafts'] as List<dynamic>?) ?? const <dynamic>[];
    return list
        .map((e) => DraftModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
