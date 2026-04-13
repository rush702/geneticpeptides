#!/bin/bash
# ─────────────────────────────────────────────────────────
#  PepAssure — Deploy ALL files to Netlify
#  Deploys: index.html, for-vendors.html, _headers
# ─────────────────────────────────────────────────────────

cd "/Users/joshuarush/Documents/Claude/Projects/new co" || exit 1

SITE_ID="gleeful-cendol-e067e4"

echo "═══════════════════════════════════════════════"
echo "  🚀 PepAssure — Deploy to pepassure.com"
echo "═══════════════════════════════════════════════"
echo ""

# ── Step 1: Get Netlify Token ──────────────────────────
TOKEN_FILE="$HOME/.netlify_token"

if [ -f "$TOKEN_FILE" ]; then
  TOKEN=$(cat "$TOKEN_FILE")
  echo "✅ Found saved token."
else
  echo "Netlify Personal Access Token needed."
  echo ""
  echo "  1. Go to: app.netlify.com/user/applications"
  echo "  2. Personal access tokens → New access token → Generate"
  echo "  3. Copy and paste it below"
  echo ""
  open "https://app.netlify.com/user/applications#personal-access-tokens"
  echo ""
  read -rp "Paste your Netlify token: " TOKEN
  echo "$TOKEN" > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
  echo "✅ Token saved."
fi

echo ""
echo "📦 Zipping deploy folder (all files)..."
DEPLOY_ZIP="/tmp/pepassure_deploy_$(date +%s).zip"

cd deploy || exit 1
zip -j "$DEPLOY_ZIP" index.html for-vendors.html _headers 2>/dev/null
zip -j "$DEPLOY_ZIP" index.html for-vendors.html 2>/dev/null || true
cd ..

echo "✅ Zip created: $(du -sh "$DEPLOY_ZIP" | cut -f1)"
echo ""
echo "🚀 Uploading to Netlify (site: $SITE_ID)..."
echo ""

RESULT=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary "@$DEPLOY_ZIP")

HTTP_CODE=$(echo "$RESULT" | tail -1)
BODY=$(echo "$RESULT" | head -1)

rm -f "$DEPLOY_ZIP"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  DEPLOY_URL=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('deploy_ssl_url') or d.get('ssl_url') or 'https://pepassure.com')" 2>/dev/null || echo "https://pepassure.com")
  echo "═══════════════════════════════════════════════"
  echo "  ✅ DEPLOYED!"
  echo "     Homepage:    https://pepassure.com"
  echo "     For Vendors: https://pepassure.com/for-vendors"
  echo "═══════════════════════════════════════════════"
  open "https://pepassure.com/for-vendors"
else
  echo "❌ Deploy failed (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
  if [ "$HTTP_CODE" = "401" ]; then
    echo ""
    echo "Token invalid — deleting saved token. Run again to re-enter."
    rm -f "$TOKEN_FILE"
  fi
fi

echo ""
read -rp "Press Enter to close..."
