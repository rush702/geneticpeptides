#!/bin/bash
# PeptideRank — Smart Deploy v2
HTML="/Users/joshuarush/Documents/Claude/Projects/new co/peptiderank_website.html"
LOG="/tmp/peptide_deploy_log.txt"
echo "=== PeptideRank Deploy v2 ===" > "$LOG"
date >> "$LOG"

# ── Test internet ─────────────────────────────────────────────────────────────
echo "Testing internet..." | tee -a "$LOG"
PING=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" "https://google.com")
echo "Google ping: $PING" >> "$LOG"

if [ "$PING" = "000" ]; then
  osascript -e 'display dialog "No internet access from Terminal.\n\nPlease do this manually (30 sec):\n1. Open Chrome\n2. Go to: netlify.com/drop\n3. Drag your file: new co/peptiderank_website.html\n4. Get your live URL!" buttons {"Open netlify.com/drop"} default button 1 with title "Manual Deploy Needed"'
  open "https://netlify.com/drop"
  exit 1
fi
echo "Internet: OK" | tee -a "$LOG"

# ── Build zip for Netlify ─────────────────────────────────────────────────────
ZIP="/tmp/pr_$(date +%s).zip"
cp "$HTML" /tmp/index.html
cd /tmp && zip -q "$ZIP" index.html
echo "Zip built: $ZIP ($(du -h $ZIP | cut -f1))" >> "$LOG"

# ── Try Netlify API ───────────────────────────────────────────────────────────
echo "Trying Netlify API..." | tee -a "$LOG"
NL_RESP=$(curl -s --max-time 20 -X POST \
  -H "Content-Type: application/zip" \
  --data-binary @"$ZIP" \
  "https://api.netlify.com/api/v1/sites")
echo "Netlify raw response: $NL_RESP" >> "$LOG"

NL_URL=$(echo "$NL_RESP" | python3 -c "
import sys, json
try:
  d = json.load(sys.stdin)
  print(d.get('ssl_url') or d.get('url') or '')
except Exception as e:
  print('')
" 2>/dev/null)

if [[ -n "$NL_URL" && "$NL_URL" == http* ]]; then
  echo "$NL_URL" | pbcopy
  osascript -e "display dialog \"🎉 LIVE on Netlify!\n\n$NL_URL\n\n(URL copied to clipboard)\" buttons {\"Open Site\",\"Close\"} default button 1 with title \"PeptideRank is Live!\""
  [ $? -eq 0 ] && open "$NL_URL"
  exit 0
fi

# ── Try Cloudflare Pages (via wrangler, if installed) ─────────────────────────
echo "Trying cloudflare..." | tee -a "$LOG"
if command -v wrangler &>/dev/null; then
  mkdir -p /tmp/cf_deploy
  cp "$HTML" /tmp/cf_deploy/index.html
  CF_OUT=$(cd /tmp/cf_deploy && wrangler pages deploy . --project-name peptiderank 2>&1)
  CF_URL=$(echo "$CF_OUT" | grep -o 'https://[^ ]*\.pages\.dev' | head -1)
  if [[ -n "$CF_URL" ]]; then
    echo "$CF_URL" | pbcopy
    osascript -e "display dialog \"🎉 Live on Cloudflare Pages!\n\n$CF_URL\n\n(copied to clipboard)\" buttons {\"Open\",\"Close\"} default button 1 with title \"Deployed!\""
    [ $? -eq 0 ] && open "$CF_URL"
    exit 0
  fi
fi

# ── Try npx serve + ngrok ─────────────────────────────────────────────────────
if command -v ngrok &>/dev/null; then
  echo "Trying ngrok tunnel..." | tee -a "$LOG"
  mkdir -p /tmp/ngrok_serve
  cp "$HTML" /tmp/ngrok_serve/index.html
  python3 -m http.server 18080 --directory /tmp/ngrok_serve &>/dev/null &
  SRV_PID=$!
  sleep 2
  NGROK_OUT=$(ngrok http 18080 --log stdout --log-format json 2>/dev/null &)
  sleep 4
  NG_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['tunnels'][0]['public_url'])" 2>/dev/null)
  if [[ -n "$NG_URL" ]]; then
    echo "$NG_URL" | pbcopy
    osascript -e "display dialog \"🌐 Live via ngrok!\n\n$NG_URL\n\n(copied - keep Terminal open to stay live)\" buttons {\"Open\",\"Close\"} default button 1 with title \"PeptideRank Tunnel Active\""
    [ $? -eq 0 ] && open "$NG_URL"
    wait $SRV_PID
    exit 0
  fi
  kill $SRV_PID 2>/dev/null
fi

# ── All failed — open Netlify Drop and Finder side by side ───────────────────
echo "All automated methods failed. Opening Netlify Drop manually..." | tee -a "$LOG"
cat "$LOG"

# Open Netlify drop in browser
open "https://netlify.com/drop"
sleep 2

# Open Finder at the right folder
open "/Users/joshuarush/Documents/Claude/Projects/new co/"

osascript -e 'display dialog "Almost there! 🚀\n\nNetlify Drop just opened in your browser.\nYour folder just opened in Finder.\n\nJust DRAG the file:\n\"peptiderank_website.html\"\n\nfrom Finder → onto the Netlify Drop zone in Chrome.\n\nYou'\''ll have a live URL in 10 seconds!" buttons {"Got it!"} default button 1 with title "One More Step"'
