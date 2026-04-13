#!/bin/bash
# PeptideRank Website Uploader
# Tries Netlify API → surge → serveo fallback

HTML_FILE="/Users/joshuarush/Documents/Claude/Projects/new co/peptiderank_website.html"

show_dialog() {
  osascript -e "display dialog \"$1\" buttons {\"OK\"} default button \"OK\" with title \"PeptideRank Deploy\""
}

show_success() {
  local URL="$1"
  echo "$URL" | pbcopy
  CHOICE=$(osascript -e "display dialog \"🎉 PeptideRank is LIVE!\n\nURL (copied to clipboard):\n$URL\" buttons {\"Open Site\", \"Close\"} default button \"Open Site\" with title \"PeptideRank Deploy\"" 2>&1)
  if [[ "$CHOICE" == *"Open Site"* ]]; then
    open "$URL"
  fi
}

# ── Method 1: Netlify anonymous deploy ────────────────────────────────────────
echo "Trying Netlify..."
ZIP_PATH="/tmp/peptide_site_$(date +%s).zip"
mkdir -p /tmp/peptide_deploy
cp "$HTML_FILE" /tmp/peptide_deploy/index.html
cd /tmp/peptide_deploy && zip -q -r "$ZIP_PATH" index.html

NETLIFY_RESP=$(curl -s --max-time 20 -X POST \
  -H "Content-Type: application/zip" \
  --data-binary @"$ZIP_PATH" \
  "https://api.netlify.com/api/v1/sites" 2>/dev/null)

NETLIFY_URL=$(echo "$NETLIFY_RESP" | python3 -c \
  "import sys,json
try:
  d=json.load(sys.stdin)
  print(d.get('ssl_url') or d.get('url') or '')
except:
  print('')" 2>/dev/null)

if [[ -n "$NETLIFY_URL" && "$NETLIFY_URL" == http* ]]; then
  show_success "$NETLIFY_URL"
  exit 0
fi

# ── Method 2: surge.sh (if node/npx available) ────────────────────────────────
echo "Trying surge..."
if command -v npx &>/dev/null || command -v surge &>/dev/null; then
  mkdir -p /tmp/surge_deploy
  cp "$HTML_FILE" /tmp/surge_deploy/index.html
  SURGE_DOMAIN="peptiderank-$(date +%s).surge.sh"
  SURGE_OUT=$(cd /tmp/surge_deploy && surge . "$SURGE_DOMAIN" 2>&1)
  if [[ "$SURGE_OUT" == *"surge.sh"* ]]; then
    SURGE_URL="https://$SURGE_DOMAIN"
    show_success "$SURGE_URL"
    exit 0
  fi
fi

# ── Method 3: Serveo SSH tunnel (temporary, but shareable) ────────────────────
echo "Trying serveo tunnel..."
# Start local server
cd "/Users/joshuarush/Documents/Claude/Projects/new co/"
python3 -m http.server 28080 &>/dev/null &
SERVER_PID=$!
sleep 2

# Tunnel via serveo (runs in background, captures URL)
SERVEO_LOG="/tmp/serveo_$$.log"
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 \
  -R 80:localhost:28080 serveo.net > "$SERVEO_LOG" 2>&1 &
SERVEO_PID=$!
sleep 4

SERVEO_URL=$(grep -o 'https://[a-z]*.serveo.net' "$SERVEO_LOG" 2>/dev/null | head -1)

if [[ -n "$SERVEO_URL" ]]; then
  # Keep alive message
  osascript -e "display dialog \"🌐 PeptideRank Tunnel Active!\n\nShared URL:\n$SERVEO_URL\n\n⚠️ This link works while this terminal stays open.\nFor a permanent link, drag your HTML file to netlify.com/drop\" buttons {\"Open Site\", \"Close\"} default button \"Open Site\" with title \"PeptideRank Deploy\""
  CHOICE=$?
  if [[ $CHOICE -eq 0 ]]; then
    open "$SERVEO_URL"
  fi
  # Wait for user to be done
  wait $SERVEO_PID
else
  kill $SERVER_PID $SERVEO_PID 2>/dev/null
  # All methods failed — show manual instructions
  show_dialog "All auto-deploy methods failed.\n\n✅ EASY MANUAL OPTION (30 sec):\n1. Go to netlify.com/drop in Chrome\n2. Drag this file there:\n   'new co/peptiderank_website.html'\n3. Get your live URL instantly — no account needed!"
fi
