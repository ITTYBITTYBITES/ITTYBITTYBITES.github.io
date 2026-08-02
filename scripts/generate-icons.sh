#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p public/icons

# Standard PNG icons from the SVG source.
convert -background white public/icons/icon.svg -resize 192x192 public/icons/icon-192.png
convert -background white public/icons/icon.svg -resize 512x512 public/icons/icon-512.png
convert -background white public/icons/icon.svg -resize 180x180 public/icons/apple-touch-icon.png

# Maskable icon keeps content inside the safe zone (80% of the canvas).
convert -background white public/icons/icon.svg -resize 154x154 -gravity center -extent 192x192 public/icons/maskable-192.png

echo "Icons generated."
