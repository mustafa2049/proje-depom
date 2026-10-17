#!/usr/bin/env bash
# Kurulabilir Android APK'sını üretir ve proje köküne english-study-app.apk olarak kopyalar.
# Gereksinimler: Node 20+, JDK 17+, ANDROID_HOME (Android SDK yolu). Kullanım: npm run android:apk
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/apps/mobile-web"
OUTPUT="$ROOT/english-study-app.apk"

: "${ANDROID_HOME:?ANDROID_HOME ayarlı değil; Android SDK yolunu verin (ör. export ANDROID_HOME=\$HOME/Android/Sdk)}"

cd "$APP"
# android/ klasörü app.json'dan her seferinde yeniden üretilir (Continuous Native Generation).
CI=1 npx expo prebuild --platform android --clean --no-install

cd "$APP/android"
./gradlew assembleRelease --no-daemon --console=plain

cp "$APP/android/app/build/outputs/apk/release/app-release.apk" "$OUTPUT"
echo "APK hazır: $OUTPUT"
