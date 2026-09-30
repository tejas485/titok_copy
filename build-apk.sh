#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo "  StreamGrid Titan — Android APK Build Pipeline"
echo "========================================================"

if command -v flutter >/dev/null 2>&1; then
  echo "[1/3] Fetching Flutter & Titan packages..."
  flutter pub get
  echo "[2/3] Generating Android platform bindings if missing..."
  if [ ! -f "android/gradlew" ]; then
    flutter create --platforms=android --org com.streamgrid .
  fi
  echo "[3/3] Compiling Release APK..."
  flutter build apk --release
  echo "✅ APK compiled at: build/app/outputs/flutter-apk/app-release.apk"
else
  echo "Flutter SDK not detected locally. Building standalone WebView Hybrid APK via Python compiler..."
  python3 scripts/generate_apk.py --mode apk --out dist/streamgrid-titan-v1.0.0.apk
  echo "✅ Signed APK generated at: dist/streamgrid-titan-v1.0.0.apk"
fi
