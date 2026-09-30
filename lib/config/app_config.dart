// lib/config/app_config.dart

/// Central configuration class for the live backend server & gRPC Video Streaming Engine.
/// Supports both the live ngrok gRPC endpoint (ChannelCredentials.insecure)
/// and HTTP/2 bridge fallback.
class AppConfig {
  AppConfig._();

  /// Central configuration variable pointing to the public URL: https://github.dev
  static const String centralPublicUrl = 'https://github.dev';

  /// Live mutable URL used when pasting a custom Codespace / tunnel URL for testing
  static String activeTestingUrl = centralPublicUrl;

  /// ==========================================================================
  /// MASTER CONFIGURATION BLUEPRINT: TWO-WAY MOBILE TO CODESPACE gRPC ENGINE
  /// ==========================================================================
  /// - Forwarded Link: https://<YOUR-CODESPACE-SUBDOMAIN>-3005.app.github.dev
  /// - ClientChannel Target Strip: Remove leading "https://" prefix
  /// - Operational Network Port: 443 (Routes externally on 443 -> Node port 3005)
  static String codespaceForwardedHost = 'df2ab177205f54.lhr.life';
  static const int codespaceGatewayPort = 443;
  static const int codespaceInternalNodePort = 3005;

  /// Strips leading `tcp://`, `https://`, or `http://` and trailing slashes for gRPC ClientChannel
  static String stripHttpsPrefix(String rawUrl) {
    final Match? tcpMatch =
        RegExp(r'tcp://([^\s/]+)', caseSensitive: false).firstMatch(rawUrl);
    final String candidate = tcpMatch != null ? tcpMatch.group(1)! : rawUrl;
    return candidate
        .trim()
        .replaceFirst(RegExp(r'^(tcp|https?)://', caseSensitive: false), '')
        .replaceAll(RegExp(r'/+$'), '');
  }

  /// Extracts only the hostname (e.g. `0.tcp.ap.ngrok.io`) from `tcp://0.tcp.ap.ngrok.io:12345`
  static String extractHost(String rawUrl) {
    final String stripped = stripHttpsPrefix(rawUrl);
    if (stripped.contains(':')) {
      return stripped.split(':').first.trim();
    }
    return stripped;
  }

  /// Extracts the TCP port number (e.g. `12345`) from `tcp://0.tcp.ap.ngrok.io:12345`
  static int? extractPort(String rawUrl) {
    final String stripped = stripHttpsPrefix(rawUrl);
    if (stripped.contains(':')) {
      final String portPart = stripped.split(':').last.trim();
      return int.tryParse(portPart);
    }
    return null;
  }

  /// Applies a pasted URL for live mobile-to-server testing (updates both ngrok TCP & HTTP host)
  static String applyPastedTestingUrl(String rawUrl) {
    final String trimmed = rawUrl.trim();
    if (trimmed.isEmpty) return codespaceForwardedHost;
    final String strippedHostPort = stripHttpsPrefix(trimmed);
    codespaceForwardedHost = strippedHostPort;
    ngrokHostTarget = extractHost(trimmed);
    final int? parsedPort = extractPort(trimmed);
    if (parsedPort != null) {
      ngrokPortTarget = parsedPort;
    }
    activeTestingUrl =
        trimmed.startsWith('http://') || trimmed.startsWith('https://')
            ? trimmed.replaceAll(RegExp(r'/+$'), '')
            : 'https://$strippedHostPort';
    return strippedHostPort;
  }

  /// 64KB (65,536 bytes) sequential chunk size for `UploadMediaFile` Client-Streaming
  static const int uploadChunkSizeBytes = 64 * 1024;

  /// Live Remote Address Endpoint Connection (ngrok TCP tunnel -> port 3005)
  static String ngrokHostTarget = '0.tcp.ap.ngrok.io';
  static int ngrokPortTarget = 12345;

  /// Security Level: Insecure (Use ChannelCredentials.insecure() for regional development sandboxes)
  static const bool useInsecureChannelCredentials = true;

  /// Default gRPC Authentication Client ID
  static const String grpcMobileClientId = 'mobile_phone_client';

  /// Default 10th Profile Folder ID containing all 9 videos (v1.mp4 .. v9.mp4)
  static const String masterProfileId = 'profile_10_all';

  /// Total videos in the backend directory for modulo loop calculation
  static const int totalServerVideos = 9;

  /// Calculates the 1-based wrapped video index (1..9):
  /// - Requesting index 9 -> v9.mp4
  /// - Requesting index 10 -> wraps around to v1.mp4
  static int resolveWrappedVideoIndex(int requestedIndex) {
    if (requestedIndex <= 0) return 1;
    return ((requestedIndex - 1) % totalServerVideos) + 1;
  }

  /// Resolves the canonical filename ("v1.mp4" .. "v9.mp4") for any video_index
  static String resolveVideoFilename(int requestedIndex) {
    final int wrapped = resolveWrappedVideoIndex(requestedIndex);
    return 'v$wrapped.mp4';
  }

  /// gRPC-Bridge endpoints on the live server
  static String get grpcGetAuthTokenEndpoint =>
      '$activeTestingUrl/api/grpc/GetAuthToken';
  static String get grpcStreamFeedVideoEndpoint =>
      '$activeTestingUrl/api/grpc/StreamFeedVideo';
  static String get grpcGetProfileDataEndpoint =>
      '$activeTestingUrl/api/grpc/GetProfileData';
  static String get grpcSearchVideosEndpoint =>
      '$activeTestingUrl/api/grpc/SearchVideos';
  static String get grpcUploadMediaFileEndpoint =>
      '$activeTestingUrl/api/grpc/UploadMediaFile';

  /// Screen 2 (Video Feed) endpoint returning the array of feed items with `stream_url`
  static String get feedEndpoint => '$activeTestingUrl/feed';

  /// Screen 3 (Camera & Upload) multipart video upload endpoint
  static String get uploadEndpoint => '$activeTestingUrl/upload';

  /// Screen 7 (User Profile) endpoint that appends `:username` to `/profile/:username`
  static String profileByUsernameEndpoint(String username) {
    final normalized = username.trim().startsWith('@')
        ? username.trim()
        : '@${username.trim()}';
    return '$activeTestingUrl/profile/${Uri.encodeComponent(normalized)}';
  }

  /// Direct Drive proxy media stream endpoint
  static String mediaStreamEndpoint(String fileId) {
    return '$activeTestingUrl/media/stream/${Uri.encodeComponent(fileId)}';
  }

  /// Screen 4 (Comments) endpoint
  static String commentsEndpoint(String videoId) {
    return '$activeTestingUrl/comments/${Uri.encodeComponent(videoId)}';
  }

  /// Screen 12 (Video Drafts) endpoint
  static String get draftsEndpoint => '$activeTestingUrl/drafts';

  /// Authentication & session endpoints
  static String get authLoginEndpoint => '$activeTestingUrl/auth/login';
  static String get authSignupEndpoint => '$activeTestingUrl/auth/signup';
  static String get authLogoutEndpoint => '$activeTestingUrl/auth/logout';
}
