// lib/config/app_config.dart

/// Central configuration class for the live backend server architecture.
/// All generated text models, video grid lists, profile aggregations,
/// and feed viewports reference [AppConfig.centralPublicUrl] pointing to
/// the public URL: https://github.dev
class AppConfig {
  AppConfig._();

  /// Central configuration variable pointing to the public URL: https://github.dev
  static const String centralPublicUrl = 'https://github.dev';

  /// Screen 2 (Video Feed) endpoint returning the array of feed items with `stream_url`
  static String get feedEndpoint => '$centralPublicUrl/feed';

  /// Screen 3 (Camera & Upload) multipart video upload endpoint
  static String get uploadEndpoint => '$centralPublicUrl/upload';

  /// Screen 7 (User Profile) endpoint that appends `:username` to `/profile/:username`
  /// to fetch matching creator metadata and video grid data loops
  static String profileByUsernameEndpoint(String username) {
    final normalized = username.trim().startsWith('@')
        ? username.trim()
        : '@${username.trim()}';
    return '$centralPublicUrl/profile/${Uri.encodeComponent(normalized)}';
  }

  /// Direct Drive proxy media stream endpoint
  static String mediaStreamEndpoint(String fileId) {
    return '$centralPublicUrl/media/stream/${Uri.encodeComponent(fileId)}';
  }

  /// Screen 4 (Comments) endpoint
  static String commentsEndpoint(String videoId) {
    return '$centralPublicUrl/comments/${Uri.encodeComponent(videoId)}';
  }

  /// Screen 12 (Video Drafts) endpoint
  static String get draftsEndpoint => '$centralPublicUrl/drafts';

  /// Authentication & session endpoints
  static String get authLoginEndpoint => '$centralPublicUrl/auth/login';
  static String get authSignupEndpoint => '$centralPublicUrl/auth/signup';
  static String get authLogoutEndpoint => '$centralPublicUrl/auth/logout';
}
