#!/usr/bin/env bash
# Process images pipeline: Download → Cleanup → Resize → Convert to WebP
# Made by Druhin
set -euo pipefail

# Functions
format_duration() {
  local T=$1
  local H=$((T/3600)) M=$((T%3600/60)) S=$((T%60))
  printf "%02d:%02d:%02d" $H $M $S
}

# Configuration
LINKS_FILE="links.txt"
TOTAL=$(wc -l < "$LINKS_FILE")
BAR_WIDTH=40

# Start timer
START_TIME=$(date +%s)

echo "Starting processing of $TOTAL files..."

# Ensure directories
mkdir -p downloads cleaned resized webp

i=0
while IFS= read -r url || [[ -n "$url" ]]; do
  ((i++))
  num=$(printf "%04d" $i)
  # Extract extension
  path="${url%%\?*}"
  ext="${path##*.}"
  extLower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

  # Download
  wget -q --show-progress -O "downloads/${num}.${extLower}" "$url"

  # Cleanup: pdf → jpg; avif/webp → png; others copy
  case "$extLower" in
    pdf)
      magick "downloads/${num}.pdf[0]" "cleaned/${num}.jpg"
      cleanedExt="jpg";;
    avif)
      magick "downloads/${num}.avif" "cleaned/${num}.png"
      cleanedExt="png";;
    webp)
      magick "downloads/${num}.webp" "cleaned/${num}.png"
      cleanedExt="png";;
    *)
      cp "downloads/${num}.${extLower}" "cleaned/${num}.${extLower}"
      cleanedExt="$extLower";;
  esac

  # Resize
  magick "cleaned/${num}.${cleanedExt}" -resize "1080x>" "resized/${num}.${cleanedExt}"

  # Convert to WebP
  magick "resized/${num}.${cleanedExt}" -quality 75 "webp/${num}.webp"

  # Progress bar
  elapsed=$(( $(date +%s) - START_TIME ))
  avg=$(awk "BEGIN {print $elapsed/$i}")
  remaining=$((TOTAL - i))
  eta=$(printf "%.0f" "$(awk "BEGIN {print $avg*$remaining}")")
  pct=$(( i * 100 / TOTAL ))
  filled=$(( pct * BAR_WIDTH / 100 ))
  empty=$(( BAR_WIDTH - filled ))
  bar=$(printf '█%.0s' $(seq 1 $filled))
  spaces=$(printf ' %.0s' $(seq 1 $empty))
  printf "\r\033[1;34m[%s%s]\033[0m %3d%% (%d/%d) Elapsed: %s ETA: %s" \
    "$bar" "$spaces" "$pct" "$i" "$TOTAL" \
    "$(format_duration $elapsed)" "$(format_duration $eta)"
done < "$LINKS_FILE"

echo -e "\n\033[1;32mAll done! 🎉 Made by Druhin\033[0m"
