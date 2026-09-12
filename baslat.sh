#!/usr/bin/env sh
# Saati varsayilan tarayicida acar (Linux / macOS / WSL).
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

if command -v python3 >/dev/null 2>&1; then
  exec python3 "$DIR/baslat.py" "$@"
fi

FILE="file://$DIR/index.html"
if command -v xdg-open >/dev/null 2>&1; then xdg-open "$FILE"
elif command -v open     >/dev/null 2>&1; then open "$FILE"
elif command -v wslview  >/dev/null 2>&1; then wslview "$FILE"
else echo "Tarayici acilamadi. Elle acin: $FILE"; fi
