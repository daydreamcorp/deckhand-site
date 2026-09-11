#!/usr/bin/env bash
# Regenerates assets/og-image.png (1200×630) from the site's own palette and the Fira faces in the app repo's design folder.
set -euo pipefail
SITE="$(cd "$(dirname "$0")/.." && pwd)"
F="${FIRA_DIR:-/home/thisfuck/Code/Mobile/deckhand/design}"
test -f "$F/FiraSansCondensed-Bold.ttf" && test -f "$F/FiraSans-Regular.ttf" || { echo "Fira TTFs not found in $F" >&2; exit 1; }
magick -size 1200x630 -define gradient:angle=115 gradient:'#090B15-#1B1038' \
  \( -size 1200x630 radial-gradient:'#00E5FF48-#00E5FF00' \) -compose Over -composite \
  \( "$SITE/assets/icon.png" -resize 150x150 \) -gravity NorthWest -geometry +72+150 -compose Over -composite \
  -gravity NorthWest -font "$F/FiraSansCondensed-Bold.ttf" -pointsize 132 -fill '#F4F4FF' -annotate +250+128 'Deckhand' \
  -font "$F/FiraSans-Regular.ttf" -pointsize 28 -fill '#9FA6D0' -kerning 4 -annotate +256+282 'YOUR POCKET-SIZED COMMAND DECK' \
  -kerning 0 -font "$F/FiraSansCondensed-Bold.ttf" -pointsize 52 -fill '#00E5FF' -annotate +256+372 'Looking for 12 testers.' \
  -font "$F/FiraSans-Regular.ttf" -pointsize 26 -fill '#CBCFEC' -annotate +258+450 'Fourteen days, three months of Elite, no hardware to buy.' \
  -strip -dither FloydSteinberg -colors 255 -define png:compression-level=9 "$SITE/assets/og-image.png"   # 255 colours + dithering: the smooth gradient quantises invisibly and the file shrinks by ~40%
magick identify -format '%wx%h %m %b\n' "$SITE/assets/og-image.png"
