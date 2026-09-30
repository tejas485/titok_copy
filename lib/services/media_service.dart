// lib/services/media_service.dart
import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:grpc/grpc.dart';

import '../config/app_config.dart';
import 'grpc_video_engine.dart';

class MediaService {
  ClientChannel? _channel;

  // Singleton pattern to keep a single instance across the app lifecycle
  static final MediaService _instance = MediaService._internal();
  factory MediaService({GrpcVideoEngine? engine}) => _instance;
  MediaService._internal() : _engine = GrpcVideoEngine.instance;

  final GrpcVideoEngine _engine;

  String codespaceHost = 'jtkdm-20-192-21-48.run.pinggy-free.link';
  int codespacePort = 38173;

  static const int uploadChunkSizeBytes = 64 * 1024;

  /// Natively instantiates a new HTTP/2 binary connection channel at runtime
  void connectToTunnel(String inputUrl) {
    try {
      // Clean input: remove any accidental prefixes or spaces
      String cleanedUrl = inputUrl
          .replaceAll('tcp://', '')
          .replaceAll('https://', '')
          .replaceAll('http://', '')
          .trim();

      String host;
      int port;

      if (cleanedUrl.contains(':')) {
        final parts = cleanedUrl.split(':');
        host = parts[0].trim();
        port = int.parse(parts[1].replaceAll(RegExp(r'[^0-9]'), ''));
      } else {
        // Fallback default configurations
        host = cleanedUrl.replaceAll(RegExp(r'/+$'), '');
        port = 443;
      }

      codespaceHost = host;
      codespacePort = port;
      AppConfig.ngrokHostTarget = host;
      AppConfig.ngrokPortTarget = port;
      AppConfig.codespaceForwardedHost = host;

      print('📡 Reconfiguring gRPC Route Target -> Host: $host | Port: $port');

      // Safely shut down any old active connection channel first
      _channel?.shutdown();

      // Build the fresh channel using an INSECURE configuration block
      // This allows raw binary TCP streams to pass through Pinggy without SSL blocks
      _channel = ClientChannel(
        host,
        port: port,
        options: const ChannelOptions(
          credentials: ChannelCredentials.insecure(),
        ),
      );
    } catch (e) {
      print('❌ Failed to parse connection link string: $e');
      rethrow;
    }
  }

  // Ensure active connection exists before routing RPC operations
  ClientChannel get channel {
    if (_channel == null) {
      throw Exception('Active gateway link missing. Connect to a tunnel domain first!');
    }
    return _channel!;
  }

  void applyNgrokTcpTunnel(String rawUrl) => connectToTunnel(rawUrl);

  Future<AuthTokenMessage> getAuthToken({bool forceRefresh = false}) {
    return _engine.getAuthToken(
      clientId: AppConfig.grpcMobileClientId,
      forceRefresh: forceRefresh,
    );
  }

  Future<CompiledVideoBufferAsset> streamFeedVideo({
    required int videoIndex,
    void Function(double progress, int currentByte, int totalBytes)? onProgress,
  }) {
    return _engine.streamFeedVideo(
      videoIndex: videoIndex,
      onProgress: onProgress,
    );
  }

  Future<Map<String, dynamic>> fetch10thProfileFolder({
    String profileId = AppConfig.masterProfileId,
  }) async {
    final GrpcProfileDataMessage response = await _engine.getProfileData(
      profileId: profileId,
    );
    return <String, dynamic>{
      'success': response.success,
      'profile_id': response.profileId,
      'username': response.username,
      'display_name': response.displayName,
      'avatar_url': response.avatarUrl,
      'video_list': List<String>.from(response.videoList),
      'videos': List<Map<String, dynamic>>.from(response.videos),
    };
  }

  Future<GrpcSearchVideosMessage> searchVideosFromServer({String query = ''}) {
    return _engine.searchVideos(query: query);
  }

  Future<UploadMediaResponseMessage> uploadMediaFile({
    required String filename,
    File? localMp4File,
    Uint8List? rawBytes,
    void Function(double progress, int chunkIndex, int totalChunks)? onChunkProgress,
  }) async {
    Uint8List payloadBytes;
    if (rawBytes != null && rawBytes.isNotEmpty) {
      payloadBytes = rawBytes;
    } else if (localMp4File != null && await localMp4File.exists()) {
      payloadBytes = await localMp4File.readAsBytes();
    } else {
      payloadBytes = Uint8List(uploadChunkSizeBytes * 4);
    }
    return _engine.uploadMediaFile(
      filename: filename,
      fileBytes: payloadBytes,
      onChunkProgress: onChunkProgress,
    );
  }
}
