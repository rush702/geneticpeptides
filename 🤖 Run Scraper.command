#!/bin/bash
# PepAssure — Daily Scraper + Inject + Deploy
# Runs the Reddit/Finnrick/site scraper, injects fresh data into the website,
# then redeploys to pepassure.com via Netlify.
#
# First-time setup:
#   1. Get Reddit API credentials at https://www.reddit.com/prefs/apps
#      (Create app → type: script)
#   2. Run this script — it will prompt you for the credentials and save them.

clear
echo "═══════════════════════════════════════════════════"
echo "  🤖 PepAssure Daily Scraper"
echo "═══════════════════════════════════════════════════"
echo ""

PROJ="/Users/joshuarush/Documents/Claude/Projects/new co"
SCRAPER="$PROJ/scraper/peptideverify_scraper.py"
INJECTOR="$PROJ/scraper/inject_vendor_data.py"
CONFIG="$HOME/.pepassure_config"
NETLIFY_TOKEN="nfp_ZaJ6m4nE1ddGpB7ZpnPHxv2HpD2etjpBf2d9"
SITE_ID="851035d7-ae0c-43c8-a62b-df5d4edc58a0"

# ── Load or prompt for Reddit credentials ────────────────────────────────────
if [[ -f "$CONFIG" ]]; then
  source "$CONFIG"
  echo "  🔑 Loaded Reddit credentials from ~/.pepassure_config"
else
  # No config found — create empty one so scraper runs without Reddit sentiment.
  # (Run 🔑 Setup Stripe.command or manually edit ~/.pepassure_config to add creds.)
  cat > "$CONFIG" <<'EOFCFG'
REDDIT_CLIENT_ID=""
REDDIT_CLIENT_SECRET=""
REDDIT_USER_AGENT="PeptideVerify:v1.0 (by /u/peptideverify_bot)"
EOFCFG
  chmod 600 "$CONFIG"
  echo "  ⚠️  No ~/.pepassure_config found — created empty one."
  echo "     Reddit sentiment will be skipped; vendor/Finnrick data will update."
fi

export REDDIT_CLIENT_ID
export REDDIT_CLIENT_SECRET
export REDDIT_USER_AGENT="${REDDIT_USER_AGENT:-PeptideVerify:v1.0 (by /u/peptideverify_bot)}"

# ── Check / install Python deps ───────────────────────────────────────────────
echo ""
echo "  📦 Checking Python dependencies..."
PY3=$(command -v python3 || command -v python)
if [[ -z "$PY3" ]]; then
  echo "  ❌ Python 3 not found. Install from https://python.org"
  read -rp "Press Enter to close..."; exit 1
fi

$PY3 -c "import requests, bs4, praw" 2>/dev/null
if [[ $? -ne 0 ]]; then
  echo "  Installing: requests beautifulsoup4 praw..."
  $PY3 -m pip install requests beautifulsoup4 praw --quiet 2>&1 | tail -3
  $PY3 -c "import requests, bs4, praw" 2>/dev/null
  if [[ $? -ne 0 ]]; then
    echo "  ❌ Failed to install dependencies. Try:"
    echo "     pip3 install requests beautifulsoup4 praw"
    read -rp "Press Enter to close..."; exit 1
  fi
fi
echo "  ✅ All dependencies ready"

# ── Run scraper ───────────────────────────────────────────────────────────────
echo ""
echo "  🔍 Running scraper (vendor sites · Finnrick · Reddit)..."
echo "  This takes ~2-3 minutes. Please wait..."
echo ""

cd "$PROJ"
$PY3 "$SCRAPER"
SCRAPER_EXIT=$?

if [[ $SCRAPER_EXIT -ne 0 ]]; then
  echo ""
  echo "  ❌ Scraper failed (exit $SCRAPER_EXIT). Check output above for errors."
  read -rp "Press Enter to close..."; exit 1
fi

if [[ ! -f "$PROJ/vendor_data.json" ]]; then
  echo "  ❌ vendor_data.json was not created. Check scraper logs above."
  read -rp "Press Enter to close..."; exit 1
fi

VENDOR_COUNT=$(python3 -c "import json; d=json.load(open('vendor_data.json')); print(d['vendor_count'])" 2>/dev/null || echo "?")
echo ""
echo "  ✅ Scraped $VENDOR_COUNT vendors → vendor_data.json"

# ── Fetch fresh Reddit sentiment (public JSON API, no creds needed) ───────────
echo ""
echo "  🤖 Fetching Reddit sentiment scores..."
$PY3 "$PROJ/scraper/fetch_reddit_sentiment.py"
if [[ $? -ne 0 ]]; then
  echo "  ⚠️  Reddit fetch failed — using existing reddit_sentiment.json scores."
fi

# ── Apply Reddit sentiment from JSON into vendor_data.json ───────────────────
echo ""
echo "  📊 Applying Reddit sentiment scores..."
$PY3 "$PROJ/scraper/apply_reddit_sentiment.py"
if [[ $? -ne 0 ]]; then
  echo "  ❌ Reddit sentiment patch failed."
  read -rp "Press Enter to close..."; exit 1
fi

# ── Inject fresh data into HTML ───────────────────────────────────────────────
echo ""
echo "  💉 Injecting fresh data into website..."
$PY3 "$INJECTOR"
if [[ $? -ne 0 ]]; then
  echo "  ❌ Injection failed. vendor_data.json saved but HTML not updated."
  read -rp "Press Enter to close..."; exit 1
fi

# ── Deploy to Netlify (file digest — fixes text/plain browser bug) ────────────
echo "  🚀 Deploying to pepassure.com..."

HTML_FILE="$PROJ/deploy/index.html"
SHA1=$(openssl dgst -sha1 "$HTML_FILE" | awk '{print $2}')
DIGEST_BODY=$(python3 -c "import json,sys; print(json.dumps({'files': {'/index.html': sys.argv[1]}}))" "$SHA1")

STEP1=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys" \
  -H "Authorization: Bearer $NETLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DIGEST_BODY")

HTTP1=$(echo "$STEP1" | tail -1)
BODY1=$(echo "$STEP1" | sed '$d')

if [[ "$HTTP1" == "200" || "$HTTP1" == "201" ]]; then
  DEPLOY_ID=$(echo "$BODY1" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
  echo "  ⬆️  Uploading index.html…"

  STEP2=$(curl -s -w "\n%{http_code}" -X PUT \
    "https://api.netlify.com/api/v1/deploys/$DEPLOY_ID/files/index.html" \
    -H "Authorization: Bearer $NETLIFY_TOKEN" \
    -H "Content-Type: application/octet-stream" \
    --data-binary "@$HTML_FILE")

  HTTP2=$(echo "$STEP2" | tail -1)
  if [[ "$HTTP2" == "200" || "$HTTP2" == "201" ]]; then
    echo "  ✅ Deploy #${DEPLOY_ID:0:8} live!"
  else
    echo "  ⚠️  File upload returned HTTP $HTTP2 — run 🚀 Deploy NOW.command to retry."
  fi
else
  echo "  ⚠️  Deploy create returned HTTP $HTTP1"
  echo "     Data is updated locally. Run 🚀 Deploy NOW.command to retry."
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ Scraper run complete!"
echo ""
UPDATED=$(python3 -c "import json; d=json.load(open('vendor_data.json')); print(d['generated_at'][:19].replace('T',' '))" 2>/dev/null)
echo "  Data timestamp: $UPDATED UTC"
echo "  Site:           https://pepassure.com"
echo "═══════════════════════════════════════════════════"
echo ""
read -rp "Press Enter to close..."
