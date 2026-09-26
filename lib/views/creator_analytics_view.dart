// lib/views/creator_analytics_view.dart
import 'package:flutter/material.dart';

/// Screen 11 (Creator Analytics):
/// Displays video retention metrics, total views, and audience telemetry.
class CreatorAnalyticsView extends StatelessWidget {
  const CreatorAnalyticsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0B0E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0B0E),
        title: const Text('Creator Studio Analytics'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _MetricCard(
            title: 'Total Video Views (7d)',
            value: '1,482,900',
            delta: '+18.4%',
          ),
          SizedBox(height: 12),
          _MetricCard(
            title: 'Average stream_url Completion Rate',
            value: '84.2%',
            delta: '+4.1%',
          ),
          SizedBox(height: 12),
          _MetricCard(
            title: 'Profile Loop Visits (/profile/:username)',
            value: '64,310',
            delta: '+12.9%',
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String delta;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.delta,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF151824),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(color: Colors.white60, fontSize: 12),
              ),
              const SizedBox(height: 6),
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
          Text(
            delta,
            style: const TextStyle(
              color: Color(0xFF10B981),
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }
}
