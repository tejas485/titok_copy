// lib/views/app_settings_view.dart
import 'package:flutter/material.dart';
import 'package:titan_bastion/titan_bastion.dart';

import '../config/app_config.dart';
import '../services/auth_service.dart';
import '../services/theme_pillar.dart';

/// Screen 10 (App Settings, 12-Color Theme Selector & Day/Night Mode):
/// Powered by Titan [ThemePillar] reactive state management with smooth
/// animated color transitions and Day/Night theme switching.
class AppSettingsView extends StatefulWidget {
  final ThemePillar themePillar;
  final AuthService authService;
  final VoidCallback? onLoggedOut;

  const AppSettingsView({
    super.key,
    required this.themePillar,
    required this.authService,
    this.onLoggedOut,
  });

  @override
  State<AppSettingsView> createState() => _AppSettingsViewState();
}

class _AppSettingsViewState extends State<AppSettingsView> {
  bool _pushNotificationsEnabled = true;
  bool _hardwareAcceleratedDecoding = true;
  bool _preloadNextStreamSegment = true;

  @override
  Widget build(BuildContext context) {
    return Vestige<ThemePillar>(
      pillar: widget.themePillar,
      builder: (context, theme) {
        final bool isNight = theme.isNightMode.value;
        final Color activeColor = theme.primaryAccent.value;
        final AppAccentColorOption activeOption =
            theme.activeColorOption.value;
        final int selectedIdx = theme.selectedColorIndex.value;

        final Color bgColor =
            isNight ? const Color(0xFF090A0F) : const Color(0xFFF8FAFC);
        final Color cardColor =
            isNight ? const Color(0xFF131622) : const Color(0xFFFFFFFF);
        final Color textColor =
            isNight ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A);
        final Color subTextColor =
            isNight ? const Color(0xFF94A3B8) : const Color(0xFF64748B);

        return AnimatedContainer(
          duration: const Duration(milliseconds: 380),
          curve: Curves.easeOutCubic,
          color: bgColor,
          child: Scaffold(
            backgroundColor: Colors.transparent,
            appBar: AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              title: Text(
                'Appearance & Studio Settings',
                style: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.w800,
                  fontSize: 18,
                ),
              ),
            ),
            body: ListView(
              padding: const EdgeInsets.all(18),
              children: [
                // 1. DAY / NIGHT MODE SELECTOR CARD
                AnimatedContainer(
                  duration: const Duration(milliseconds: 350),
                  curve: Curves.easeOutCubic,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: cardColor,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: activeColor.withOpacity(0.35),
                      width: 1.2,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              AnimatedSwitcher(
                                duration: const Duration(milliseconds: 300),
                                transitionBuilder: (child, anim) =>
                                    RotationTransition(
                                  turns: anim,
                                  child: ScaleTransition(
                                    scale: anim,
                                    child: child,
                                  ),
                                ),
                                child: Icon(
                                  isNight
                                      ? Icons.dark_mode_rounded
                                      : Icons.wb_sunny_rounded,
                                  key: ValueKey<bool>(isNight),
                                  color: activeColor,
                                  size: 24,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Day / Night Mode Selector',
                                    style: TextStyle(
                                      color: textColor,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 15,
                                    ),
                                  ),
                                  Text(
                                    isNight
                                        ? 'Night Mode (OLED Cinema Dark)'
                                        : 'Day Mode (Alabaster Daylight)',
                                    style: TextStyle(
                                      color: subTextColor,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Switch.adaptive(
                            value: isNight,
                            activeColor: activeColor,
                            onChanged: (val) => theme.setNightMode(val),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => theme.setNightMode(false),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 260),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: !isNight
                                      ? activeColor
                                      : bgColor.withOpacity(0.5),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.wb_sunny_rounded,
                                      size: 16,
                                      color:
                                          !isNight ? Colors.black : subTextColor,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Day Mode',
                                      style: TextStyle(
                                        color: !isNight
                                            ? Colors.black
                                            : subTextColor,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => theme.setNightMode(true),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 260),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: isNight
                                      ? activeColor
                                      : bgColor.withOpacity(0.5),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.nights_stay_rounded,
                                      size: 16,
                                      color:
                                          isNight ? Colors.black : subTextColor,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Night Mode',
                                      style: TextStyle(
                                        color: isNight
                                            ? Colors.black
                                            : subTextColor,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // 2. 12-COLOR THEME SELECTOR GRID (TITAN PILLAR)
                AnimatedContainer(
                  duration: const Duration(milliseconds: 350),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: cardColor,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isNight ? Colors.white10 : Colors.black12,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '12-Color App Theme Selector',
                            style: TextStyle(
                              color: textColor,
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: activeColor.withOpacity(0.18),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: activeColor),
                            ),
                            child: Text(
                              '${activeOption.name} (${activeOption.hex})',
                              style: TextStyle(
                                color: activeColor,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Powered by Titan reactive Core<int>. Tap any swatch to animate the entire app theme:',
                        style: TextStyle(color: subTextColor, fontSize: 12),
                      ),
                      const SizedBox(height: 16),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: ThemePillar.palette12.length,
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 4,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: 1.05,
                        ),
                        itemBuilder: (context, index) {
                          final option = ThemePillar.palette12[index];
                          final bool isSelected = index == selectedIdx;
                          return GestureDetector(
                            onTap: () => theme.selectColor(index),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 280),
                              curve: Curves.easeOutBack,
                              decoration: BoxDecoration(
                                color: option.color.withOpacity(0.14),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: isSelected
                                      ? option.color
                                      : Colors.transparent,
                                  width: isSelected ? 2.4 : 1,
                                ),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 250),
                                    width: isSelected ? 30 : 24,
                                    height: isSelected ? 30 : 24,
                                    decoration: BoxDecoration(
                                      color: option.color,
                                      shape: BoxShape.circle,
                                      boxShadow: isSelected
                                          ? [
                                              BoxShadow(
                                                color: option.color
                                                    .withOpacity(0.55),
                                                blurRadius: 10,
                                                spreadRadius: 1,
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: isSelected
                                        ? const Icon(
                                            Icons.check,
                                            size: 16,
                                            color: Colors.black,
                                          )
                                        : null,
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    option.name.split(' ').last,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: textColor,
                                      fontSize: 10,
                                      fontWeight: isSelected
                                          ? FontWeight.w800
                                          : FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // 3. PERFORMANCE & PLAYBACK ENGINE
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardColor,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isNight ? Colors.white10 : Colors.black12,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Performance & Playback Optimization',
                        style: TextStyle(
                          color: textColor,
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                        ),
                      ),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        value: _hardwareAcceleratedDecoding,
                        activeColor: activeColor,
                        title: Text(
                          '60fps Hardware VideoPlayer Decoding',
                          style: TextStyle(color: textColor, fontSize: 13),
                        ),
                        subtitle: Text(
                          'Zero-jank vertical PageView scrolling',
                          style: TextStyle(color: subTextColor, fontSize: 11),
                        ),
                        onChanged: (val) => setState(
                          () => _hardwareAcceleratedDecoding = val,
                        ),
                      ),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        value: _preloadNextStreamSegment,
                        activeColor: activeColor,
                        title: Text(
                          'Pre-buffer Next stream_url Viewport',
                          style: TextStyle(color: textColor, fontSize: 13),
                        ),
                        subtitle: Text(
                          'Seamless instant start from ${AppConfig.feedEndpoint}',
                          style: TextStyle(color: subTextColor, fontSize: 11),
                        ),
                        onChanged: (val) => setState(
                          () => _preloadNextStreamSegment = val,
                        ),
                      ),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        value: _pushNotificationsEnabled,
                        activeColor: activeColor,
                        title: Text(
                          'Real-Time Push Notifications',
                          style: TextStyle(color: textColor, fontSize: 13),
                        ),
                        onChanged: (val) => setState(
                          () => _pushNotificationsEnabled = val,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // 4. CENTRAL CLOUD URL & LOGOUT
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardColor,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isNight ? Colors.white10 : Colors.black12,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'CENTRAL CLOUD BACKEND',
                        style: TextStyle(
                          color: subTextColor,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        AppConfig.centralPublicUrl,
                        style: TextStyle(
                          color: activeColor,
                          fontSize: 14,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFFF43F5E),
                          ),
                          onPressed: () async {
                            await widget.authService.logout();
                            widget.onLoggedOut?.call();
                          },
                          icon: const Icon(Icons.logout),
                          label: const Text('Log Out Session'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
