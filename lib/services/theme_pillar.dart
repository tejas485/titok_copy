// lib/services/theme_pillar.dart
import 'package:flutter/material.dart';
import 'package:titan/titan.dart';

class AppAccentColorOption {
  final int index;
  final String name;
  final Color color;
  final String hex;

  const AppAccentColorOption({
    required this.index,
    required this.name,
    required this.color,
    required this.hex,
  });
}

/// Titan Pillar managing the 12-Color Theme Selector and Day/Night Mode
/// with smooth animated transitions across the entire Flutter application.
class ThemePillar extends Pillar {
  static const List<AppAccentColorOption> palette12 = <AppAccentColorOption>[
    AppAccentColorOption(
      index: 0,
      name: 'Electric Amber',
      color: Color(0xFFF59E0B),
      hex: '#F59E0B',
    ),
    AppAccentColorOption(
      index: 1,
      name: 'TikTok Crimson',
      color: Color(0xFFFE2C55),
      hex: '#FE2C55',
    ),
    AppAccentColorOption(
      index: 2,
      name: 'Cyber Cyan',
      color: Color(0xFF00F2FE),
      hex: '#00F2FE',
    ),
    AppAccentColorOption(
      index: 3,
      name: 'Neon Violet',
      color: Color(0xFF8B5CF6),
      hex: '#8B5CF6',
    ),
    AppAccentColorOption(
      index: 4,
      name: 'Emerald Pulse',
      color: Color(0xFF10B981),
      hex: '#10B981',
    ),
    AppAccentColorOption(
      index: 5,
      name: 'Sunset Coral',
      color: Color(0xFFFF6B6B),
      hex: '#FF6B6B',
    ),
    AppAccentColorOption(
      index: 6,
      name: 'Royal Indigo',
      color: Color(0xFF6366F1),
      hex: '#6366F1',
    ),
    AppAccentColorOption(
      index: 7,
      name: 'Hot Magenta',
      color: Color(0xFFEC4899),
      hex: '#EC4899',
    ),
    AppAccentColorOption(
      index: 8,
      name: 'Lime Volt',
      color: Color(0xFF84CC16),
      hex: '#84CC16',
    ),
    AppAccentColorOption(
      index: 9,
      name: 'Ocean Azure',
      color: Color(0xFF0EA5E9),
      hex: '#0EA5E9',
    ),
    AppAccentColorOption(
      index: 10,
      name: 'Gold Luxe',
      color: Color(0xFFEAB308),
      hex: '#EAB308',
    ),
    AppAccentColorOption(
      index: 11,
      name: 'Rose Quartz',
      color: Color(0xFFF43F5E),
      hex: '#F43F5E',
    ),
  ];

  /// Reactive Titan Core holding the active color index (0..11)
  late final Core<int> selectedColorIndex = core<int>(0);

  /// Reactive Titan Core holding Day/Night mode (`true` = Night/Dark, `false` = Day/Light)
  late final Core<bool> isNightMode = core<bool>(true);

  /// Reactive Titan Core for high-frame-rate 60fps smooth animations
  late final Core<bool> smoothAnimationsEnabled = core<bool>(true);

  /// Derived active accent color option
  late final Derived<AppAccentColorOption> activeColorOption =
      derived<AppAccentColorOption>(
    () => palette12[selectedColorIndex.value % palette12.length],
  );

  /// Derived active primary [Color]
  late final Derived<Color> primaryAccent = derived<Color>(
    () => activeColorOption.value.color,
  );

  /// Select one of the 12 theme colors
  void selectColor(int index) => strike(() {
        if (index >= 0 && index < palette12.length) {
          selectedColorIndex.value = index;
        }
      });

  /// Toggle between Day (Light) and Night (Dark) mode
  void toggleDayNightMode() => strike(() {
        isNightMode.value = !isNightMode.value;
      });

  /// Explicitly set Day (`false`) or Night (`true`) mode
  void setNightMode(bool night) => strike(() {
        isNightMode.value = night;
      });

  /// Builds the Material 3 [ThemeData] for smooth [AnimatedTheme] transitions
  ThemeData buildThemeData() {
    final bool dark = isNightMode.value;
    final Color seed = primaryAccent.value;
    final Brightness brightness = dark ? Brightness.dark : Brightness.light;

    final Color scaffoldBg =
        dark ? const Color(0xFF090A0F) : const Color(0xFFF8FAFC);
    final Color cardSurface =
        dark ? const Color(0xFF131520) : const Color(0xFFFFFFFF);
    final Color textPrimary =
        dark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A);

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: scaffoldBg,
      primaryColor: seed,
      colorScheme: ColorScheme.fromSeed(
        seedColor: seed,
        brightness: brightness,
        primary: seed,
        surface: cardSurface,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: scaffoldBg,
        foregroundColor: textPrimary,
        elevation: 0,
        centerTitle: false,
      ),
      cardColor: cardSurface,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: ZoomPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),
    );
  }
}
