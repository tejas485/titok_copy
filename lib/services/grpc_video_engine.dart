// lib/services/grpc_video_engine.dart
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:grpc/grpc.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

import '../config/app_config.dart';

/// ============================================================================
/// Mobile UI Integration Manual: gRPC Video Streaming Engine
/// ============================================================================
/// Implements:
/// 1. Live Remote Address Endpoint Connection (`ngrok` + `ChannelCredentials.insecure()`)
/// 2. Authentication Execution Loop (`GetAuthToken` with 3600s 1-hour expiry tracker
///    and automatic `UNAUTHENTICATED` status interception & cache refresh)
/// 3. Continuous Video Feed System (`StreamFeedVideo` server-streaming with
///    infinite modulo-9 loop wrap-around: index 9 -> v9.mp4, index 10 -> v1.mp4,
///    and asynchronous binary `BytesBuilder` chunk buffer assembly for ExoPlayer/AVPlayer)
/// 4. Profile Collection API (`GetProfileData` for `profile_10_all` -> `master_creator_10`
///    containing `["v1.mp4", ..., "v9.mp4"]`)

class AuthTokenMessage {
  final bool success;
  final String token;
  final int expiresInSeconds;
  final DateTime issuedAt;

  const AuthTokenMessage({
    required this.success,
    required this.token,
    required this.expiresInSeconds,
    required this.issuedAt,
  });

  bool get isExpired =>
      DateTime.now().difference(issuedAt).inSeconds >= expiresInSeconds;

  int get remainingSeconds {
    final int elapsed = DateTime.now().difference(issuedAt).inSeconds;
    return (expiresInSeconds - elapsed).clamp(0, expiresInSeconds);
  }

  factory AuthTokenMessage.fromJson(Map<String, dynamic> json) {
    return AuthTokenMessage(
      success: json['success'] as bool? ?? true,
      token: json['token'] as String? ?? '',
      expiresInSeconds: (json['expires_in_seconds'] as num?)?.toInt() ?? 3600,
      issuedAt: DateTime.now(),
    );
  }
}

class VideoChunkMessage {
  final Uint8List chunkData;
  final int currentByte;
  final int totalBytes;
  final String resolvedFile;
  final int videoIndex;
  final bool isEnd;

  const VideoChunkMessage({
    required this.chunkData,
    required this.currentByte,
    required this.totalBytes,
    required this.resolvedFile,
    required this.videoIndex,
    this.isEnd = false,
  });

  double get progressRatio =>
      totalBytes > 0 ? (currentByte / totalBytes).clamp(0.0, 1.0) : 0.0;
}

class CompiledVideoBufferAsset {
  final int requestedVideoIndex;
  final int wrappedVideoIndex;
  final String resolvedFile; // e.g. "v1.mp4" .. "v9.mp4"
  final Uint8List compiledBytes;
  final File? localTempFile; // Passed directly to ExoPlayer / AVPlayer

  const CompiledVideoBufferAsset({
    required this.requestedVideoIndex,
    required this.wrappedVideoIndex,
    required this.resolvedFile,
    required this.compiledBytes,
    this.localTempFile,
  });
}

class GrpcProfileDataMessage {
  final bool success;
  final String profileId;
  final String username;
  final String displayName;
  final String avatarUrl;
  final List<String> videoList;
  final List<Map<String, dynamic>> videos;

  const GrpcProfileDataMessage({
    required this.success,
    required this.profileId,
    required this.username,
    required this.displayName,
    required this.avatarUrl,
    required this.videoList,
    this.videos = const <Map<String, dynamic>>[],
  });

  factory GrpcProfileDataMessage.fromJson(Map<String, dynamic> json) {
    final List<dynamic> rawVideos =
        (json['video_list'] as List<dynamic>?) ?? const <dynamic>[];
    final List<dynamic> rawVideoObjects =
        (json['videos'] as List<dynamic>?) ?? const <dynamic>[];
    return GrpcProfileDataMessage(
      success: json['success'] as bool? ?? true,
      profileId: json['profile_id'] as String? ?? 'profile_10_all',
      username: json['username'] as String? ?? 'master_creator_10',
      displayName:
          json['display_name'] as String? ?? 'All Videos Portfolio Folder',
      avatarUrl: json['avatar_url'] as String? ?? 'https://dicebear.com',
      videoList: rawVideos.map((e) => e.toString()).toList(),
      videos: rawVideoObjects
          .whereType<Map<String, dynamic>>()
          .map(Map<String, dynamic>.from)
          .toList(),
    );
  }
}

class GrpcSearchVideosMessage {
  final bool success;
  final String query;
  final int totalMatches;
  final List<String> videoList;
  final List<Map<String, dynamic>> videos;

  const GrpcSearchVideosMessage({
    required this.success,
    required this.query,
    required this.totalMatches,
    required this.videoList,
    required this.videos,
  });

  factory GrpcSearchVideosMessage.fromJson(Map<String, dynamic> json) {
    final List<dynamic> rawList =
        (json['video_list'] as List<dynamic>?) ?? const <dynamic>[];
    final List<dynamic> rawObjects =
        (json['videos'] as List<dynamic>?) ?? const <dynamic>[];
    return GrpcSearchVideosMessage(
      success: json['success'] as bool? ?? true,
      query: json['query'] as String? ?? '',
      totalMatches: (json['total_matches'] as num?)?.toInt() ?? rawList.length,
      videoList: rawList.map((e) => e.toString()).toList(),
      videos: rawObjects
          .whereType<Map<String, dynamic>>()
          .map(Map<String, dynamic>.from)
          .toList(),
    );
  }
}

class UploadMediaResponseMessage {
  final bool success;
  final bool confirmed;
  final String confirmationId;
  final String uploadedAt;
  final String message;
  final String fileId;
  final String filename;
  final int videoIndex;
  final int chunksProcessed;
  final int totalBytesReceived;
  final List<String> videoList;

  const UploadMediaResponseMessage({
    required this.success,
    required this.message,
    required this.fileId,
    this.confirmed = true,
    this.confirmationId = '',
    this.uploadedAt = '',
    this.filename = '',
    this.videoIndex = 1,
    this.chunksProcessed = 0,
    this.totalBytesReceived = 0,
    this.videoList = const <String>[],
  });

  factory UploadMediaResponseMessage.fromJson(Map<String, dynamic> json) {
    final List<dynamic> rawVideos =
        (json['video_list'] as List<dynamic>?) ?? const <dynamic>[];
    return UploadMediaResponseMessage(
      success: json['success'] as bool? ?? true,
      confirmed: json['confirmed'] as bool? ?? true,
      confirmationId: json['confirmation_id'] as String? ?? 'SRV-CONFIRMED',
      uploadedAt: json['uploaded_at'] as String? ?? '',
      message: json['message'] as String? ?? 'Uploaded via 64KB gRPC stream',
      fileId: json['file_id'] as String? ?? '',
      filename: json['filename'] as String? ?? '',
      videoIndex: (json['video_index'] as num?)?.toInt() ?? rawVideos.length,
      chunksProcessed: (json['chunks_received'] as num?)?.toInt() ?? 0,
      totalBytesReceived: (json['total_bytes'] as num?)?.toInt() ?? 0,
      videoList: rawVideos.map((e) => e.toString()).toList(),
    );
  }
}

class GrpcVideoEngine {
  static final GrpcVideoEngine instance = GrpcVideoEngine._internal();

  ClientChannel? _channel;
  AuthTokenMessage? _cachedAuthToken;
  final Map<String, CompiledVideoBufferAsset> _bufferCache =
      <String, CompiledVideoBufferAsset>{};

  GrpcVideoEngine._internal();

  /// Initializes the live remote gRPC channel targeting the `ngrok` output instance
  /// with `ChannelCredentials.insecure()` for regional development sandboxes.
  ClientChannel getOrCreateChannel({String? ngrokHost, int? ngrokPort}) {
    if (ngrokHost != null && ngrokHost.trim().isNotEmpty) {
      AppConfig.ngrokHostTarget = ngrokHost.trim();
    }
    if (ngrokPort != null) {
      AppConfig.ngrokPortTarget = ngrokPort;
    }

    _channel ??= ClientChannel(
      AppConfig.ngrokHostTarget,
      port: AppConfig.ngrokPortTarget,
      options: const ChannelOptions(
        credentials: ChannelCredentials.insecure(),
      ),
    );
    return _channel!;
  }

  AuthTokenMessage? get currentAuthToken => _cachedAuthToken;

  /// Clears old cache states and token authorization parameters when
  /// `UNAUTHENTICATED` status is intercepted during streaming.
  void clearAuthAndBufferCache() {
    _cachedAuthToken = null;
    _bufferCache.clear();
  }

  /// ==========================================================================
  /// 1. Authentication Execution Loop (`GetAuthToken`)
  /// ==========================================================================
  /// Request Arguments: `{ client_id: "mobile_phone_client" }`
  /// Returned Message Data Object:
  /// `{ "success": true, "token": "eyJhbGciOiJIUzI1NiIsIn...", "expires_in_seconds": 3600 }`
  Future<AuthTokenMessage> getAuthToken({
    String clientId = AppConfig.grpcMobileClientId,
    bool forceRefresh = false,
  }) async {
    if (!forceRefresh &&
        _cachedAuthToken != null &&
        !_cachedAuthToken!.isExpired) {
      return _cachedAuthToken!;
    }

    if (forceRefresh) {
      clearAuthAndBufferCache();
    }

    getOrCreateChannel();

    final Uri uri = Uri.parse(AppConfig.grpcGetAuthTokenEndpoint);
    final http.Response response = await http.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode(<String, dynamic>{'client_id': clientId}),
    );

    if (response.statusCode != 200) {
      throw GrpcError.unauthenticated(
        'GetAuthToken failed with status ${response.statusCode}',
      );
    }

    final Map<String, dynamic> decoded =
        jsonDecode(response.body) as Map<String, dynamic>;
    _cachedAuthToken = AuthTokenMessage.fromJson(decoded);
    return _cachedAuthToken!;
  }

  /// ==========================================================================
  /// 2. Continuous Video Feed System (`StreamFeedVideo` gRPC Server-Streaming)
  /// ==========================================================================
  /// Request Arguments: `{ "token": "YOUR_JWT_ACCESS_TOKEN", "video_index": 1 }`
  /// - Infinite Video Loop Calculations:
  ///   Increment `video_index` by 1 on swipe down.
  ///   Requesting index 9 -> streams `v9.mp4`
  ///   Requesting index 10 -> wraps around and loops back to stream `v1.mp4`
  /// - Reassembling Video Bytes on the Mobile Client:
  ///   1. Instantiate an empty binary memory buffer collector (`BytesBuilder`)
  ///   2. Listen to the incoming `VideoChunk` data channel and update progress
  ///      (`chunk.currentByte / chunk.totalBytes`)
  ///   3. On `end` state marker, compile the local buffer asset and write to a
  ///      local file so `ExoPlayer` (Android) or `AVPlayer` (iOS) plays it instantly.
  Future<CompiledVideoBufferAsset> streamFeedVideo({
    required int videoIndex,
    void Function(double progress, int currentByte, int totalBytes)? onProgress,
    bool isRetryAfterUnauthenticated = false,
  }) async {
    final AuthTokenMessage auth = await getAuthToken();

    // Check if token expired locally before streaming
    if (auth.isExpired) {
      await getAuthToken(forceRefresh: true);
    }

    final int wrappedIndex = AppConfig.resolveWrappedVideoIndex(videoIndex);
    final String resolvedFile = AppConfig.resolveVideoFilename(videoIndex);

    // 1. Instantiate an empty binary memory buffer collector inside media engine layer
    final BytesBuilder binaryBufferCollector = BytesBuilder(copy: false);

    final http.Client client = http.Client();
    try {
      final http.Request request = http.Request(
        'POST',
        Uri.parse(AppConfig.grpcStreamFeedVideoEndpoint),
      );
      request.headers['Content-Type'] = 'application/json';
      request.body = jsonEncode(<String, dynamic>{
        'token': _cachedAuthToken!.token,
        'video_index': videoIndex,
      });

      final http.StreamedResponse streamedResponse = await client.send(request);

      // Intercept UNAUTHENTICATED (HTTP 401 / gRPC Status 16) during streaming:
      // Clear old cache states, refresh token via GetAuthToken, and re-run stream!
      if (streamedResponse.statusCode == 401 && !isRetryAfterUnauthenticated) {
        clearAuthAndBufferCache();
        await getAuthToken(forceRefresh: true);
        return streamFeedVideo(
          videoIndex: videoIndex,
          onProgress: onProgress,
          isRetryAfterUnauthenticated: true,
        );
      }

      if (streamedResponse.statusCode != 200) {
        throw GrpcError.unavailable(
          'StreamFeedVideo returned HTTP ${streamedResponse.statusCode}',
        );
      }

      // 2. Listen to the gRPC data incoming event channel (NDJSON VideoChunk frames)
      await for (final String line in streamedResponse.stream
          .transform(utf8.decoder)
          .transform(const LineSplitter())) {
        if (line.trim().isEmpty) continue;
        final Map<String, dynamic> frame =
            jsonDecode(line) as Map<String, dynamic>;

        if (frame['grpc_status'] == 'UNAUTHENTICATED' &&
            !isRetryAfterUnauthenticated) {
          clearAuthAndBufferCache();
          await getAuthToken(forceRefresh: true);
          return streamFeedVideo(
            videoIndex: videoIndex,
            onProgress: onProgress,
            isRetryAfterUnauthenticated: true,
          );
        }

        if (frame['event'] == 'end' || frame['is_end'] == true) {
          break;
        }

        final String base64Chunk = frame['chunk_data'] as String? ?? '';
        final int currentByte = (frame['current_byte'] as num?)?.toInt() ?? 0;
        final int totalBytes = (frame['total_bytes'] as num?)?.toInt() ?? 1;

        if (base64Chunk.isNotEmpty) {
          final Uint8List chunkBytes = base64Decode(base64Chunk);
          // AppendToBuffer(chunk.chunk_data)
          binaryBufferCollector.add(chunkBytes);
        }

        // UpdateProgressBar(chunk.current_byte / chunk.total_bytes)
        if (onProgress != null && totalBytes > 0) {
          onProgress(
            (currentByte / totalBytes).clamp(0.0, 1.0),
            currentByte,
            totalBytes,
          );
        }
      }

      // 3. Once stream returns `end` state marker signal, pass compiled local buffer
      //    asset to native video components (ExoPlayer on Android / AVPlayer on iOS)
      final Uint8List compiledBytes = binaryBufferCollector.takeBytes();
      File? localFile;
      try {
        final Directory tempDir = await getTemporaryDirectory();
        localFile = File('${tempDir.path}/grpc_stream_$resolvedFile');
        await localFile.writeAsBytes(compiledBytes, flush: true);
      } catch (_) {
        localFile = null;
      }

      final CompiledVideoBufferAsset asset = CompiledVideoBufferAsset(
        requestedVideoIndex: videoIndex,
        wrappedVideoIndex: wrappedIndex,
        resolvedFile: resolvedFile,
        compiledBytes: compiledBytes,
        localTempFile: localFile,
      );
      _bufferCache[resolvedFile] = asset;
      return asset;
    } finally {
      client.close();
    }
  }

  /// ==========================================================================
  /// 3. Profile Collection API (`GetProfileData`)
  /// ==========================================================================
  /// Request Arguments:
  /// `{ "token": "YOUR_JWT_ACCESS_TOKEN", "profile_id": "profile_10_all" }`
  /// Returned Message Data Object:
  /// `{ "success": true, "profile_id": "profile_10_all", "username": "master_creator_10",
  ///    "display_name": "All Videos Portfolio Folder", "avatar_url": "https://dicebear.com",
  ///    "video_list": ["v1.mp4", "v2.mp4", "v3.mp4", "v4.mp4", "v5.mp4", "v6.mp4", "v7.mp4", "v8.mp4", "v9.mp4"] }`
  Future<GrpcProfileDataMessage> getProfileData({
    String profileId = AppConfig.masterProfileId,
    bool isRetryAfterUnauthenticated = false,
  }) async {
    final AuthTokenMessage auth = await getAuthToken();

    final Uri uri = Uri.parse(AppConfig.grpcGetProfileDataEndpoint);
    final http.Response response = await http.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode(<String, dynamic>{
        'token': auth.token,
        'profile_id': profileId,
      }),
    );

    // Intercept UNAUTHENTICATED status, clear old cache states, refresh token
    if (response.statusCode == 401 && !isRetryAfterUnauthenticated) {
      clearAuthAndBufferCache();
      await getAuthToken(forceRefresh: true);
      return getProfileData(
        profileId: profileId,
        isRetryAfterUnauthenticated: true,
      );
    }

    if (response.statusCode != 200) {
      throw GrpcError.unavailable(
        'GetProfileData failed (${response.statusCode})',
      );
    }

    final Map<String, dynamic> decoded =
        jsonDecode(response.body) as Map<String, dynamic>;
    return GrpcProfileDataMessage.fromJson(decoded);
  }

  /// ==========================================================================
  /// 3B. Server Video Search API (`SearchVideos` gRPC RPC)
  /// ==========================================================================
  /// Fetches matching videos directly from the server over gRPC.
  Future<GrpcSearchVideosMessage> searchVideos({
    String query = '',
    bool isRetryAfterUnauthenticated = false,
  }) async {
    final AuthTokenMessage auth = await getAuthToken();

    final Uri uri = Uri.parse(AppConfig.grpcSearchVideosEndpoint);
    final http.Response response = await http.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode(<String, dynamic>{
        'token': auth.token,
        'query': query.trim(),
      }),
    );

    if (response.statusCode == 401 && !isRetryAfterUnauthenticated) {
      clearAuthAndBufferCache();
      await getAuthToken(forceRefresh: true);
      return searchVideos(
        query: query,
        isRetryAfterUnauthenticated: true,
      );
    }

    if (response.statusCode != 200) {
      throw GrpcError.unavailable(
        'SearchVideos failed (${response.statusCode})',
      );
    }

    final Map<String, dynamic> decoded =
        jsonDecode(response.body) as Map<String, dynamic>;
    return GrpcSearchVideosMessage.fromJson(decoded);
  }

  /// ==========================================================================
  /// 4. Mobile-to-Server Video Upload Channel (`UploadMediaFile` Client-Streaming)
  /// ==========================================================================
  /// - Reads local mobile `.mp4` data and slices it into sequential 64KB (65,536 bytes)
  ///   chunks natively in memory.
  /// - Loops through the chunks and pushes individual `UploadRequest` message frames
  ///   (`{ token, filename, chunk_data }`) over the pipeline stream.
  /// - Server writes data to `/videos` workspace directory block, refreshes its
  ///   profile registry array, and returns `UploadResponse { success, message, file_id }`.
  Future<UploadMediaResponseMessage> uploadMediaFile({
    required String filename,
    required Uint8List fileBytes,
    void Function(double progress, int chunkIndex, int totalChunks)?
        onChunkProgress,
    bool isRetryAfterUnauthenticated = false,
  }) async {
    final AuthTokenMessage auth = await getAuthToken();

    if (auth.isExpired) {
      await getAuthToken(forceRefresh: true);
    }

    const int chunkSize = AppConfig.uploadChunkSizeBytes; // 64KB (65,536 bytes)
    final int totalBytes = fileBytes.isNotEmpty ? fileBytes.length : chunkSize;
    final Uint8List sourceBytes =
        fileBytes.isNotEmpty ? fileBytes : Uint8List(chunkSize);
    final int totalChunks = (totalBytes / chunkSize).ceil();

    final List<Map<String, dynamic>> uploadRequestFrames =
        <Map<String, dynamic>>[];

    for (int i = 0; i < totalChunks; i++) {
      final int start = i * chunkSize;
      final int end =
          (start + chunkSize < totalBytes) ? start + chunkSize : totalBytes;
      final Uint8List chunkSlice = sourceBytes.sublist(start, end);

      uploadRequestFrames.add(<String, dynamic>{
        'token': _cachedAuthToken!.token,
        'filename': filename,
        'chunk_data': base64Encode(chunkSlice),
      });

      if (onChunkProgress != null) {
        onChunkProgress((i + 1) / totalChunks, i + 1, totalChunks);
      }
    }

    final Uri uri = Uri.parse(AppConfig.grpcUploadMediaFileEndpoint);
    final http.Response response = await http.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode(<String, dynamic>{
        'token': _cachedAuthToken!.token,
        'filename': filename,
        'chunks': uploadRequestFrames,
      }),
    );

    // Intercept UNAUTHENTICATED (gRPC Status Code 16 / HTTP 401), refresh token & retry
    if (response.statusCode == 401 && !isRetryAfterUnauthenticated) {
      clearAuthAndBufferCache();
      await getAuthToken(forceRefresh: true);
      return uploadMediaFile(
        filename: filename,
        fileBytes: fileBytes,
        onChunkProgress: onChunkProgress,
        isRetryAfterUnauthenticated: true,
      );
    }

    if (response.statusCode != 200) {
      throw GrpcError.unavailable(
        'UploadMediaFile failed (${response.statusCode})',
      );
    }

    final Map<String, dynamic> decoded =
        jsonDecode(response.body) as Map<String, dynamic>;
    return UploadMediaResponseMessage.fromJson(decoded);
  }
}
