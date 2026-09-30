// lib/views/search_discovery_view.dart
import 'package:flutter/material.dart';

import '../main.dart';
import '../services/api_service.dart';
import '../services/grpc_video_engine.dart';
import '../services/media_service.dart';

/// Screen 5 (Search & Discovery — Powered by gRPC `SearchVideos` Request):
/// Fetches matching videos directly from the server over gRPC (`SearchVideos` RPC)
/// and streams any selected video from the server via `StreamFeedVideo`.
class SearchDiscoveryView extends StatefulWidget {
  final ApiService apiService;
  final ValueChanged<String>? onSelectCreator;

  const SearchDiscoveryView({
    super.key,
    required this.apiService,
    this.onSelectCreator,
  });

  @override
  State<SearchDiscoveryView> createState() => _SearchDiscoveryViewState();
}

class _SearchDiscoveryViewState extends State<SearchDiscoveryView> {
  final MediaService _mediaService = MediaService();
  final TextEditingController _searchController = TextEditingController();
  late Future<GrpcSearchVideosMessage> _grpcSearchFuture;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _grpcSearchFuture = _mediaService.searchVideosFromServer(query: '');
  }

  void _triggerGrpcServerSearch(String rawQuery) {
    final String trimmed = rawQuery.trim();
    setState(() {
      _query = trimmed;
      _grpcSearchFuture = _mediaService.searchVideosFromServer(query: trimmed);
    });
  }

  void _openServerVideoStream(
    BuildContext context,
    String filename,
    int videoIndex1Based,
  ) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => Scaffold(
          backgroundColor: Colors.black,
          body: Stack(
            children: [
              VideoPlayerItem(
                videoIndex: videoIndex1Based,
                token: GrpcVideoEngine.instance.currentAuthToken?.token ??
                    'eyJhbGciOiJIUzI1NiIsIn...',
                onAuthExpired: () {
                  GrpcVideoEngine.instance.getAuthToken(forceRefresh: true);
                },
              ),
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: CircleAvatar(
                    backgroundColor: Colors.black54,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0B0E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0B0E),
        title: TextField(
          controller: _searchController,
          onChanged: _triggerGrpcServerSearch,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'gRPC SearchVideos: v1.mp4..v9.mp4, @master_creator_10...',
            hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
            prefixIcon: const Icon(Icons.search, color: Color(0xFFF59E0B)),
            suffixIcon: IconButton(
              tooltip: 'Re-fetch from Server via gRPC',
              icon: const Icon(Icons.refresh, color: Colors.white54, size: 18),
              onPressed: () => _triggerGrpcServerSearch(_searchController.text),
            ),
            filled: true,
            fillColor: const Color(0xFF151824),
            contentPadding: const EdgeInsets.symmetric(vertical: 0),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ),
      body: FutureBuilder<GrpcSearchVideosMessage>(
        future: _grpcSearchFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFFF59E0B)),
            );
          }

          final GrpcSearchVideosMessage? grpcResult = snapshot.data;
          final List<Map<String, dynamic>> serverVideos =
              grpcResult?.videos ?? const <Map<String, dynamic>>[];

          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF141724),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: const Color(0xFFF59E0B).withOpacity(0.4),
                  ),
                ),
                child: Text(
                  '📡 gRPC SearchVideos(query: "$_query") ➔ ${serverVideos.length} Server Videos Fetched',
                  style: const TextStyle(
                    color: Color(0xFFF59E0B),
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Expanded(
                child: serverVideos.isEmpty
                    ? const Center(
                        child: Text(
                          'No matching videos returned from server gRPC search.',
                          style: TextStyle(color: Colors.white54, fontSize: 13),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: serverVideos.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final Map<String, dynamic> item = serverVideos[index];
                          final String filename =
                              (item['filename'] as String?) ??
                                  'v${index + 1}.mp4';
                          final int videoIndex =
                              (item['video_index'] as num?)?.toInt() ??
                                  (index + 1);
                          final String caption = (item['caption'] as String?) ??
                              'Server gRPC Video $filename';
                          final Map<String, dynamic>? creator =
                              item['creator'] as Map<String, dynamic>?;
                          final String username =
                              (creator?['username'] as String?) ??
                                  '@master_creator_10';
                          final String viewsLabel =
                              (item['views_label'] as String?) ??
                                  '${videoIndex * 12}K';

                          return ListTile(
                            tileColor: const Color(0xFF151824),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            leading: const CircleAvatar(
                              backgroundColor: Color(0xFFF59E0B),
                              child:
                                  Icon(Icons.play_arrow, color: Colors.black),
                            ),
                            title: Row(
                              children: [
                                Text(
                                  filename,
                                  style: const TextStyle(
                                    color: Color(0xFFF59E0B),
                                    fontWeight: FontWeight.w800,
                                    fontFamily: 'monospace',
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '$username • $viewsLabel',
                                  style: const TextStyle(
                                    color: Colors.white60,
                                    fontSize: 11,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                            subtitle: Text(
                              caption,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                              ),
                            ),
                            trailing: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFF59E0B),
                                foregroundColor: Colors.black,
                              ),
                              onPressed: () => _openServerVideoStream(
                                context,
                                filename,
                                videoIndex,
                              ),
                              child: const Text(
                                '▶ Stream',
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                            onTap: () => _openServerVideoStream(
                              context,
                              filename,
                              videoIndex,
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
