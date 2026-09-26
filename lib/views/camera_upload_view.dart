// lib/views/camera_upload_view.dart
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../config/app_config.dart';
import '../services/api_service.dart';

/// Screen 3 (Camera & Upload):
/// Captures or selects video media and executes a multipart POST upload to
/// `${AppConfig.centralPublicUrl}/upload`.
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
  final TextEditingController _captionController = TextEditingController(
    text: 'Shipping our new 60fps shader pipeline #flutter #mobiledev',
  );
  final ImagePicker _picker = ImagePicker();
  String? _selectedFilePath;
  bool _uploading = false;
  String? _statusMessage;

  @override
  void dispose() {
    _captionController.dispose();
    super.dispose();
  }

  Future<void> _pickVideo(ImageSource source) async {
    final XFile? video = await _picker.pickVideo(source: source);
    if (video != null) {
      setState(() {
        _selectedFilePath = video.path;
        _statusMessage = 'Selected: ${video.name}';
      });
    }
  }

  Future<void> _submitUpload() async {
    setState(() {
      _uploading = true;
      _statusMessage = 'Uploading to ${AppConfig.uploadEndpoint}...';
    });

    try {
      final uploaded = await widget.apiService.uploadVideo(
        filePath: _selectedFilePath ?? '',
        caption: _captionController.text.trim(),
        username: '@alex_rivers_dev',
      );
      if (mounted) {
        setState(() {
          _uploading = false;
          _statusMessage = 'Published! stream_url: ${uploaded.streamUrl}';
        });
        widget.onUploadSuccess?.call();
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
          'Create & Upload Video',
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
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.videocam_rounded,
                      color: Color(0xFFF59E0B),
                      size: 64,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Target: ${AppConfig.uploadEndpoint}',
                      style: const TextStyle(
                        color: Color(0xFFF59E0B),
                        fontSize: 12,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        OutlinedButton.icon(
                          onPressed: () => _pickVideo(ImageSource.camera),
                          icon: const Icon(Icons.camera_alt),
                          label: const Text('Record 60s'),
                        ),
                        const SizedBox(width: 12),
                        OutlinedButton.icon(
                          onPressed: () => _pickVideo(ImageSource.gallery),
                          icon: const Icon(Icons.video_library),
                          label: const Text('Gallery MP4'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
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
            if (_statusMessage != null) ...[
              const SizedBox(height: 10),
              Text(
                _statusMessage!,
                style: const TextStyle(
                  color: Color(0xFFF59E0B),
                  fontSize: 12,
                  fontFamily: 'monospace',
                ),
              ),
            ],
            const SizedBox(height: 16),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: _uploading ? null : _submitUpload,
              child: Text(
                _uploading
                    ? 'Uploading to Multer & Drive Stream...'
                    : 'Publish to /upload',
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
