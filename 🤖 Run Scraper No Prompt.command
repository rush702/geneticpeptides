#!/bin/bash
# Auto-run scraper without Reddit credential prompt.
# Creates ~/.pepassure_config with empty creds so the main scraper
# skips the interactive setup and proceeds (Reddit sentiment omitted).

CONFIG="$HOME/.pepassure_config"
PROJ="/Users/joshuarush/Documents/Claude/Projects/new co"
SCRAPER="$PROJ/scraper/peptideverify_scraper.py"
INJECTOR="$PROJ/scraper/inject_vendor_data.py"
NETLIFY_TOKEN="nfp_ZaJ6m4nE1ddGpB7ZpnPHxv2HpD2etjpBf2d9"
SITE_ID="851035d7-ae0c-43c8-a62b-df5d4edc58a0"

clear
echo "═══════════════════════════════════════════════════"
echo "  🤖 PepAssure Daily Scraper (Auto)"
echo "═══════════════════════════════════════════════════"
echo ""

# Create empty config so main script skips the prompt
if [[ ! -f "$CONFIG" ]]; then
  cat > "$CONFIG" <<'EOF'
REDDIT_CLIENT_ID=""
REDDIT_CLIENT_SECRET=""
REDDIT_USER_AGENT="PeptideVerify:v1.0 (by /u/peptideverify_bot)"
EOF
  chmod 600 "$CONFIG"
  echo "  ⚠️  Created empty ~/.pepassure_config — Reddit sentiment will be skipped."
else
  echo "  🔑 ~/.pepassure_config exists — loading credentials."
fi

# Load config
source "$CONFIG"
export REDDIT_CLIENT_ID
export REDDIT_CLIENT_SECRET
export REDDIT_USER_AGENT="${REDDIT_USER_AGENT:-PeptideVerify:v1.0 (by /u/peptideverify_bot)}"

echo ""
echo "  📦 Checking Python dependencies..."
PY3=$(command -v python3 || command -v python)
if [[ -z "$PY3" ]]; then
  echo "  ❌ Python 3 not found."
  read -rp "Press Enter to close..."; exit 1
fi

$PY3 -c "import requests, bs4, praw" 2>/dev/null
if [[ $? -ne 0 ]]; then
  echo "  Installing: requests beautifulsoup4 praw..."
  $PY3 -m pip install requests beautifulsoup4 praw --quiet 2>&1 | tail -3
fi
echo "  ✅ Dependencies ready"

echo ""
echo "  🔍 Running scraper (vendor sites · Finnrick · Reddit)..."
echo "  This takes ~2-3 minutes. Please wait..."
echo ""

cd "$PROJ"
$PY3 "$SCRAPER"
SCRAPER_EXIT=$?

if [[ $SCRAPER_EXIT -ne 0 ]]; then
  echo ""
  echo "  ❌ Scraper failed (exit $SCRAPER_EXIT)."
  read -rp "Press Enter to close..."; exit 1
fi

if [[ ! -f "$PROJ/vendor_data.json" ]]; then
  echo "  ❌ vendor_data.json not created."
  read -rp "Press Enter to close..."; exit 1
fi

VENDOR_COUNT=$(python3 -c "import json; d=json.load(open('vendor_data.json')); print(d.get('vendor_count','?'))" 2>/dev/null || echo "?")
echo ""
echo "  ✅ Scraped $VENDOR_COUNT vendors → vendor_data.json"

echo ""
echo "  💉 Injecting fresh data into website..."
$PY3 "$INJECTOR"
if [[ $? -ne 0 ]]; then
  echo "  ❌ Injection failed."
  read -rp "Press Enter to close..."; exit 1
fi

echo "  🚀 Deploying to pepassure.com..."
DEPLOY_ZIP="/tmp/pepassure_scrape_$(date +%s).zip"
cd "$PROJ/deploy" && zip -j "$DEPLOY_ZIP" index.html && cd "$PROJ"

RESULT=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys" \
  -H "Authorization: Bearer $NETLIFY_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary "@$DEPLOY_ZIP")

HTTP_CODE=$(echo "$RESULT" | tail -1)
BODY=$(echo "$RESULT" | sed '$d')
rm -f "$DEPLOY_ZIP"

if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "201" ]]; then
  DEPLOY_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id','?')[:8])" 2>/dev/null)
  echo "  ✅ Deploy #$DEPLOY_ID live!"
else
  echo "  ⚠️  Deploy returned HTTP $HTTP_CODE"
  echo "     Run 🚀 Deploy NOW.command to retry."
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ Scraper run complete!"
UPDATED=$(python3 -c "import json; d=json.load(open('vendor_data.json')); print(d.get('generated_at','?')[:19].replace('T',' '))" 2>/dev/null)
echo "  Data timestamp: $UPDATED UTC"
echo "  Site:           https://pepassure.com"
echo "═══════════════════════════════════════════════════"
echo ""
read -rp "Press Enter to close..."
