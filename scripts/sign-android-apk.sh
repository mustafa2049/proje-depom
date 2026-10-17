#!/usr/bin/env bash
# APK'yı yayın anahtarıyla yeniden imzalar. Anahtar verilmezse prebuild şablonunun
# varsayılan anahtarıyla imzalı APK korunur (telefona kurulabilir, Play Store için uygun değildir).
#
# Ortam değişkenleri (GitHub Secrets): ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD,
# ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD (verilmezse keystore şifresi kullanılır).
set -euo pipefail

APK="${1:?Kullanım: sign-android-apk.sh <apk-yolu>}"
: "${ANDROID_HOME:?ANDROID_HOME ayarlı değil}"

BUILD_TOOLS="$(ls -d "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)"

if [ -n "${ANDROID_KEYSTORE_BASE64:-}" ]; then
  : "${ANDROID_KEYSTORE_PASSWORD:?ANDROID_KEYSTORE_PASSWORD gerekli}"
  : "${ANDROID_KEY_ALIAS:?ANDROID_KEY_ALIAS gerekli}"
  WORK="$(mktemp -d)"
  trap 'rm -rf "$WORK"' EXIT
  echo "$ANDROID_KEYSTORE_BASE64" | base64 --decode > "$WORK/release.keystore"

  # Anahtar şifresi ayrıca verilmediyse keystore şifresi kullanılır.
  KEY_PASS_VAR=ANDROID_KEYSTORE_PASSWORD
  if [ -n "${ANDROID_KEY_PASSWORD:-}" ]; then
    KEY_PASS_VAR=ANDROID_KEY_PASSWORD
  fi

  "$BUILD_TOOLS/zipalign" -p -f 4 "$APK" "$WORK/aligned.apk"
  "$BUILD_TOOLS/apksigner" sign \
    --ks "$WORK/release.keystore" \
    --ks-pass env:ANDROID_KEYSTORE_PASSWORD \
    --ks-key-alias "$ANDROID_KEY_ALIAS" \
    --key-pass "env:$KEY_PASS_VAR" \
    --out "$APK" "$WORK/aligned.apk"
  echo "APK yayın anahtarıyla imzalandı."
else
  echo "Yayın anahtarı tanımlı değil; varsayılan anahtarla imzalı APK kullanılıyor."
fi

"$BUILD_TOOLS/apksigner" verify --print-certs "$APK"
