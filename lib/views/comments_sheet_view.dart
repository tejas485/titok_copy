// lib/views/comments_sheet_view.dart
import 'package:flutter/material.dart';

import '../models/comment_model.dart';
import '../models/video_item_model.dart';
import '../services/api_service.dart';

/// Screen 4 (Comments Sheet):
/// Displays real-time comment threads and posts new comments to
/// `${AppConfig.centralPublicUrl}/comments/:videoId`.
class CommentsSheetView extends StatefulWidget {
  final ApiService apiService;
  final VideoItemModel videoItem;

  const CommentsSheetView({
    super.key,
    required this.apiService,
    required this.videoItem,
  });

  @override
  State<CommentsSheetView> createState() => _CommentsSheetViewState();
}

class _CommentsSheetViewState extends State<CommentsSheetView> {
  final TextEditingController _textController = TextEditingController();
  late Future<List<CommentModel>> _commentsFuture;

  @override
  void initState() {
    super.initState();
    _commentsFuture = widget.apiService.fetchComments(widget.videoItem.videoId);
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _sendComment() async {
    final String text = _textController.text.trim();
    if (text.isEmpty) return;

    _textController.clear();
    await widget.apiService.postComment(
      videoId: widget.videoItem.videoId,
      username: '@alex_rivers_dev',
      text: text,
    );
    setState(() {
      _commentsFuture =
          widget.apiService.fetchComments(widget.videoItem.videoId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.68,
      decoration: const BoxDecoration(
        color: Color(0xFF12141D),
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${widget.videoItem.commentsCount} Comments',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close, color: Colors.white70),
                ),
              ],
            ),
          ),
          const Divider(color: Colors.white12, height: 1),
          Expanded(
            child: FutureBuilder<List<CommentModel>>(
              future: _commentsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFFF59E0B)),
                  );
                }
                final List<CommentModel> comments = snapshot.data ?? const [];
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: comments.length,
                  itemBuilder: (context, index) {
                    final CommentModel c = comments[index];
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const CircleAvatar(
                        backgroundColor: Color(0xFF1F2433),
                        child: Icon(Icons.person, color: Color(0xFFF59E0B)),
                      ),
                      title: Text(
                        '${c.username}  •  ${c.createdAt}',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      subtitle: Text(
                        c.text,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                      ),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.favorite_border,
                            color: Colors.white54,
                            size: 18,
                          ),
                          Text(
                            '${c.likesCount}',
                            style: const TextStyle(
                              color: Colors.white54,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Add comment...',
                      hintStyle: const TextStyle(color: Colors.white38),
                      filled: true,
                      fillColor: const Color(0xFF1B1E2B),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _sendComment,
                  icon: const Icon(Icons.send, color: Color(0xFFF59E0B)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
