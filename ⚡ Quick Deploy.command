#!/bin/bash
# ─────────────────────────────────────────────────────────
#  PepAssure — Quick Deploy via Netlify API (no npm needed)
#  Double-click this file in Finder to deploy.
# ─────────────────────────────────────────────────────────

cd "/Users/joshuarush/Documents/Claude/Projects/new co" || exit 1

echo "═══════════════════════════════════════════════"
echo "  ⚡ PepAssure — Quick Deploy to pepassure.com"
echo "═══════════════════════════════════════════════"
echo ""

# ── Step 1: Get Netlify Token ──────────────────────────
TOKEN_FILE="$HOME/.netlify_token"

if [ -f "$TOKEN_FILE" ]; then
  TOKEN=$(cat "$TOKEN_FILE")
  echo "✅ Found saved token."
else
  echo "You need a Netlify Personal Access Token (one-time setup)."
  echo ""
  echo "  1. Your browser will open to: app.netlify.com/user/applications"
  echo "  2. Scroll to 'Personal access tokens'"
  echo "  3. Click 'New access token', name it 'PepAssure', click 'Generate'"
  echo "  4. Copy the token and paste it below"
  echo ""
  open "https://app.netlify.com/user/applications#personal-access-tokens"
  echo ""
  read -rp "Paste your Netlify token here: " TOKEN
  echo "$TOKEN" > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
  echo "✅ Token saved for future deploys."
fi

echo ""
echo "📦 Zipping deploy files..."
DEPLOY_ZIP="/tmp/pepassure_deploy_$(date +%s).zip"
mkdir -p deploy
cp peptideverify_website.html deploy/index.html
cd deploy && zip -j "$DEPLOY_ZIP" index.html && cd ..
echo "✅ Created $(du -sh "$DEPLOY_ZIP" | cut -f1) zip"

echo ""
echo "🚀 Deploying to pepassure.com (site: gleeful-cendol-e067e4)..."
echo ""

RESULT=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.netlify.com/api/v1/sites/gleeful-cendol-e067e4/deploys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary "@$DEPLOY_ZIP")

HTTP_CODE=$(echo "$RESULT" | tail -1)
BODY=$(echo "$RESULT" | head -1)

rm -f "$DEPLOY_ZIP"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  DEPLOY_URL=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('deploy_ssl_url') or d.get('ssl_url') or 'https://pepassure.com')" 2>/dev/null || echo "https://pepassure.com")
  echo "═══════════════════════════════════════════════"
  echo "  ✅ SUCCESS! Site is live at:"
  echo "     $DEPLOY_URL"
  echo "═══════════════════════════════════════════════"
  open "https://pepassure.com"
else
  echo "❌ Deploy failed (HTTP $HTTP_CODE)"
  echo ""
  echo "Response: $BODY"
  echo ""
  if [ "$HTTP_CODE" = "401" ]; then
    echo "Token may be invalid. Deleting saved token — run again to re-enter."
    rm -f "$TOKEN_FILE"
  fi
fi

echo ""
read -rp "Press Enter to close..."
