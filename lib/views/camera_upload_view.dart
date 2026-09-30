// lib/views/camera_upload_view.dart
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../config/app_config.dart';
import '../services/api_service.dart';
import '../services/media_service.dart';

/// Screen 3 (Camera & gRPC Client-Streaming 64KB Upload Pipe):
/// Implements Section 3D of the Master Configuration Blueprint:
/// - Initializes a Client-Streaming connection pipe referencing `UploadMediaFile`.
/// - Reads the local mobile `.mp4` data file and slices it into sequential,
///   low-latency 64KB (65,536 bytes) chunks natively in memory.
/// - Pushes individual `UploadRequest` frames (`token`, `filename`, `chunk_data`)
///   and receives `UploadResponse` (`success`, `message`, `file_id`).
class CameraUploadView extends StatefulWidget {
  final ApiService apiService;
  final VoidCallback? onUploadSuccess;

  const CameraUploadView({
    super.key,
    required this.apiService,
    this.onUploadSuccess,
  });

  @override
  State<CameraUploadView> createState() => _CameraUploadViewState();
}

class _CameraUploadViewState extends State<CameraUploadView> {
  final MediaService _mediaService = MediaService();
  final TextEditingController _captionController = TextEditingController(
    text: 'Streaming 64KB gRPC UploadRequest frames to /videos workspace #flutter #grpc',
  );
  final TextEditingController _filenameController = TextEditingController(
    text: 'v10.mp4',
  );
  final ImagePicker _picker = ImagePicker();

  String? _selectedFilePath;
  bool _uploading = false;
  double _chunkProgress = 0.0;
  int _currentChunk = 0;
  int _totalChunks = 0;
  String? _statusMessage;
  String? _lastUploadedFileId;
  String? _serverConfirmationId;
  String? _confirmedFilename;
  int _confirmedBytes = 0;
  int _confirmedVideoIndex = 0;

  @override
  void dispose() {
    _captionController.dispose();
    _filenameController.dispose();
    super.dispose();
  }

  Future<void> _pickVideo(ImageSource source) async {
    final XFile? video = await _picker.pickVideo(source: source);
    if (video != null) {
      setState(() {
        _selectedFilePath = video.path;
        _filenameController.text = video.name;
        _statusMessage = 'Selected local MP4: ${video.name}';
      });
    }
  }

  /// Executes the gRPC `UploadMediaFile` Client-Streaming 64KB chunk pipeline
  /// and synchronizes with `/upload`.
  Future<void> _submitGrpcChunkedUpload() async {
    final String filename = _filenameController.text.trim().isEmpty
        ? 'v10.mp4'
        : _filenameController.text.trim();

    setState(() {
      _uploading = true;
      _chunkProgress = 0.0;
      _currentChunk = 0;
      _totalChunks = 0;
      _statusMessage =
          'Slicing $filename into 64KB UploadRequest chunks for UploadMediaFile...';
    });

    try {
      File? localFile;
      if (_selectedFilePath != null && _selectedFilePath!.isNotEmpty) {
        localFile = File(_selectedFilePath!);
      }

      // 1. Stream 64KB chunks over gRPC UploadMediaFile
      final response = await _mediaService.uploadMediaFile(
        filename: filename,
        localMp4File: localFile,
        rawBytes: localFile == null
            ? Uint8List(MediaService.uploadChunkSizeBytes * 6)
            : null,
        onChunkProgress: (progress, chunkIndex, totalChunks) {
          if (mounted) {
            setState(() {
              _chunkProgress = progress;
              _currentChunk = chunkIndex;
              _totalChunks = totalChunks;
              _statusMessage =
                  'Pushing 64KB UploadRequest frame $chunkIndex/$totalChunks...';
            });
          }
        },
      );

      // 2. Also notify REST feed store so feed & profile views reflect immediately
      await widget.apiService.uploadVideo(
        filePath: _selectedFilePath ?? '',
        caption: _captionController.text.trim(),
        username: '@master_creator_10',
      );

      if (mounted) {
        setState(() {
          _uploading = false;
          _lastUploadedFileId = response.fileId;
          _serverConfirmationId = response.confirmationId;
          _confirmedFilename =
              response.filename.isNotEmpty ? response.filename : filename;
          _confirmedBytes = response.totalBytesReceived;
          _confirmedVideoIndex = response.videoIndex;
          _statusMessage =
              '✅ Server Confirmed Upload Complete: ${response.message}';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _uploading = false;
          _statusMessage = 'Upload error: $e';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0B0E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0B0E),
        title: const Text(
          'gRPC UploadMediaFile (64KB Pipe)',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF141722),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white12),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.cloud_upload_rounded,
                      color: Color(0xFFF59E0B),
                      size: 60,
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'RPC: UploadMediaFile (stream UploadRequest)',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Gateway: ${_mediaService.sanitizedCodespaceHost}:${MediaService.operationalGatewayPort} ➔ 3005',
                      style: const TextStyle(
                        color: Color(0xFFF59E0B),
                        fontSize: 11,
                        fontFamily: 'monospace',
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                          ),
                          onPressed: () => _pickVideo(ImageSource.camera),
                          icon: const Icon(Icons.camera_alt, size: 22),
                          label: const Text('Record MP4'),
                        ),
                        const SizedBox(width: 12),
                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                          ),
                          onPressed: () => _pickVideo(ImageSource.gallery),
                          icon: const Icon(Icons.video_library, size: 22),
                          label: const Text('Pick .MP4'),
                        ),
                      ],
                    ),
                    if (_uploading || _totalChunks > 0) ...[
                      const SizedBox(height: 16),
                      LinearProgressIndicator(
                        value: _chunkProgress,
                        backgroundColor: Colors.white12,
                        color: const Color(0xFFF59E0B),
                        minHeight: 8,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '64KB Chunk Stream: $_currentChunk / $_totalChunks (${(_chunkProgress * 100).toInt()}%)',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _filenameController,
              style: const TextStyle(
                color: Colors.white,
                fontFamily: 'monospace',
              ),
              decoration: InputDecoration(
                labelText: 'Target Workspace Filename (e.g. v10.mp4)',
                labelStyle: const TextStyle(color: Colors.white60),
                filled: true,
                fillColor: const Color(0xFF141722),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _captionController,
              style: const TextStyle(color: Colors.white),
              maxLines: 2,
              decoration: InputDecoration(
                labelText: 'Video Caption & Hashtags',
                labelStyle: const TextStyle(color: Colors.white60),
                filled: true,
                fillColor: const Color(0xFF141722),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            if (_lastUploadedFileId != null) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.14),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.greenAccent, width: 1.5),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '✅ SERVER CONFIRMED: UPLOAD COMPLETE',
                      style: TextStyle(
                        color: Colors.greenAccent,
                        fontWeight: FontWeight.w900,
                        fontSize: 12,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'File: $_confirmedFilename (Index #$_confirmedVideoIndex) • ID: $_lastUploadedFileId • Confirmation: $_serverConfirmationId (${(_confirmedBytes / 1024).toStringAsFixed(1)} KB)',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton.icon(
                        onPressed: () => widget.onUploadSuccess?.call(),
                        icon: const Icon(
                          Icons.play_circle_fill,
                          color: Colors.greenAccent,
                          size: 18,
                        ),
                        label: const Text(
                          'Open in Server Feed',
                          style: TextStyle(
                            color: Colors.greenAccent,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else if (_statusMessage != null) ...[
              const SizedBox(height: 8),
              Text(
                _statusMessage!,
                style: const TextStyle(
                  color: Color(0xFFF59E0B),
                  fontSize: 12,
                  fontFamily: 'monospace',
                ),
              ),
            ],
            const SizedBox(height: 12),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: _uploading ? null : _submitGrpcChunkedUpload,
              icon: const Icon(Icons.upload_file_rounded, size: 22),
              label: Text(
                _uploading
                    ? 'Streaming 64KB UploadRequest Chunks...'
                    : 'Stream 64KB Chunks via UploadMediaFile',
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
