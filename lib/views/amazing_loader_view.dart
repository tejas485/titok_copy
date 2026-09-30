// lib/views/amazing_loader_view.dart
import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Multi-ring orbital neon loader with animated audio waveform bars
/// and live stream initialization telemetry for StreamGrid.
class AmazingLoaderView extends StatefulWidget {
  final Color accentColor;
  final String statusText;

  const AmazingLoaderView({
    super.key,
    required this.accentColor,
    this.statusText = 'Mounting src/assets/reels MP4 Streams...',
  });

  @override
  State<AmazingLoaderView> createState() => _AmazingLoaderViewState();
}

class _AmazingLoaderViewState extends State<AmazingLoaderView>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF07080D),
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            final double t = _controller.value;
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 116,
                  height: 116,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Transform.rotate(
                        angle: t * 2 * math.pi,
                        child: Container(
                          width: 112,
                          height: 112,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: widget.accentColor.withOpacity(0.75),
                              width: 3,
                            ),
                          ),
                        ),
                      ),
                      Transform.rotate(
                        angle: -t * 2 * math.pi,
                        child: Container(
                          width: 82,
                          height: 82,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFFEC4899).withOpacity(0.7),
                              width: 2.5,
                            ),
                          ),
                        ),
                      ),
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: widget.accentColor,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: widget.accentColor.withOpacity(0.65),
                              blurRadius: 24,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.play_arrow_rounded,
                          color: Colors.black,
                          size: 32,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'STREAMGRID TITAN ENGINE',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2.2,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.statusText,
                  style: TextStyle(
                    color: widget.accentColor,
                    fontSize: 12,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
