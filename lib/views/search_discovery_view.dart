// lib/views/search_discovery_view.dart
import 'package:flutter/material.dart';

import '../models/video_item_model.dart';
import '../services/api_service.dart';

/// Screen 5 (Search & Discovery):
/// Searches creators, hashtags, and video streams from `${AppConfig.centralPublicUrl}/feed`.
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
  final TextEditingController _searchController = TextEditingController();
  late Future<List<VideoItemModel>> _feedFuture;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _feedFuture = widget.apiService.fetchVideoFeed();
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
          onChanged: (value) => setState(() => _query = value.trim()),
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Search @username, #shaders, or stream_url...',
            hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
            prefixIcon: const Icon(Icons.search, color: Color(0xFFF59E0B)),
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
      body: FutureBuilder<List<VideoItemModel>>(
        future: _feedFuture,
        builder: (context, snapshot) {
          final List<VideoItemModel> allVideos = snapshot.data ?? const [];
          final List<VideoItemModel> filtered = allVideos.where((v) {
            if (_query.isEmpty) return true;
            final q = _query.toLowerCase();
            return v.caption.toLowerCase().contains(q) ||
                v.creator.username.toLowerCase().contains(q) ||
                v.tags.any((t) => t.toLowerCase().contains(q));
          }).toList();

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: filtered.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final VideoItemModel item = filtered[index];
              return ListTile(
                tileColor: const Color(0xFF151824),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                leading: const CircleAvatar(
                  backgroundColor: Color(0xFFF59E0B),
                  child: Icon(Icons.play_arrow, color: Colors.black),
                ),
                title: Text(
                  item.creator.username,
                  style: const TextStyle(
                    color: Color(0xFFF59E0B),
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
                subtitle: Text(
                  item.caption,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
                trailing: const Icon(
                  Icons.chevron_right,
                  color: Colors.white54,
                ),
                onTap: () =>
                    widget.onSelectCreator?.call(item.creator.username),
              );
            },
          );
        },
      ),
    );
  }
}
