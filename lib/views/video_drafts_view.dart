// lib/views/video_drafts_view.dart
import 'package:flutter/material.dart';

import '../models/draft_model.dart';
import '../services/api_service.dart';

/// Screen 12 (Video Drafts):
/// Lists staged video drafts ready for publishing to `${AppConfig.centralPublicUrl}/upload`.
class VideoDraftsView extends StatefulWidget {
  final ApiService apiService;

  const VideoDraftsView({
    super.key,
    required this.apiService,
  });

  @override
  State<VideoDraftsView> createState() => _VideoDraftsViewState();
}

class _VideoDraftsViewState extends State<VideoDraftsView> {
  late Future<List<DraftModel>> _draftsFuture;

  @override
  void initState() {
    super.initState();
    _draftsFuture = widget.apiService.fetchDrafts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0B0E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0B0E),
        title: const Text('Local & Cloud Video Drafts'),
      ),
      body: FutureBuilder<List<DraftModel>>(
        future: _draftsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFFF59E0B)),
            );
          }
          final List<DraftModel> drafts = snapshot.data ?? const [];
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: drafts.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final DraftModel d = drafts[index];
              return ListTile(
                tileColor: const Color(0xFF151824),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                leading: const Icon(
                  Icons.movie_creation_outlined,
                  color: Color(0xFFF59E0B),
                  size: 32,
                ),
                title: Text(
                  d.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: Text(
                  '${d.duration} • ${d.resolution} • ${d.sizeMb}',
                  style: const TextStyle(
                    color: Colors.white60,
                    fontSize: 11,
                    fontFamily: 'monospace',
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
