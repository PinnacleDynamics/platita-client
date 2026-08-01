#!/bin/sh
# Platita installer — https://platita.lat
set -e
DIR="$HOME/.platita/bin"
mkdir -p "$DIR"
cd "$DIR"
curl -fsSO https://platita.lat/install.py
curl -fsSO https://platita.lat/platita_statusline.py
python3 install.py "$@"
