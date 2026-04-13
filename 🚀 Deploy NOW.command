#!/bin/bash
# PepAssure — One-Shot Deploy with saved token
TOKEN="nfp_ZaJ6m4nE1ddGpB7ZpnPHxv2HpD2etjpBf2d9"
echo "$TOKEN" > "$HOME/.netlify_token"
chmod 600 "$HOME/.netlify_token"

cd "/Users/joshuarush/Documents/Claude/Projects/new co" || exit 1

echo "═══════════════════════════════════════════"
echo "  🚀 Deploying PepAssure to pepassure.com"
echo "═══════════════════════════════════════════"
echo ""

cp peptideverify_website.html deploy/index.html
HTML_FILE="deploy/index.html"
SITE_ID="851035d7-ae0c-43c8-a62b-df5d4edc58a0"

echo "📦 $(du -sh "$HTML_FILE" | cut -f1) ready to deploy..."
echo ""

# ── File digest deploy — includes _headers to enforce text/html content-type ──
HEADERS_FILE="deploy/_headers"
SHA1_HTML=$(openssl dgst -sha1 "$HTML_FILE"    | awk '{print $2}')
SHA1_HDR=$(openssl dgst  -sha1 "$HEADERS_FILE" | awk '{print $2}')

DIGEST_BODY=$(python3 -c "
import json, sys
print(json.dumps({'files': {
  '/index.html': sys.argv[1],
  '/_headers':   sys.argv[2],
}}))
" "$SHA1_HTML" "$SHA1_HDR")

STEP1=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DIGEST_BODY")

HTTP1=$(echo "$STEP1" | tail -1)
BODY1=$(echo "$STEP1" | sed '$d')

if [ "$HTTP1" != "200" ] && [ "$HTTP1" != "201" ]; then
  echo "❌ Deploy create failed (HTTP $HTTP1)"
  echo "$BODY1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message','unknown'))" 2>/dev/null || echo "$BODY1"
  echo ""
  read -rp "Press Enter to close..."; exit 1
fi

DEPLOY_ID=$(echo "$BODY1" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
REQUIRED=$(echo "$BODY1" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin).get('required',[])))" 2>/dev/null || echo "[]")
echo "  Deploy ID: ${DEPLOY_ID:0:8}…  Uploading required files…"

# Upload each file only if Netlify says it needs it
upload_if_required() {
  local sha="$1" path="$2" local_file="$3"
  if echo "$REQUIRED" | python3 -c "import sys,json; sys.exit(0 if '$sha' in json.load(sys.stdin) else 1)" 2>/dev/null; then
    RESP=$(curl -s -w "\n%{http_code}" -X PUT \
      "https://api.netlify.com/api/v1/deploys/$DEPLOY_ID/files$path" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/octet-stream" \
      --data-binary "@$local_file")
    CODE=$(echo "$RESP" | tail -1)
    if [ "$CODE" = "200" ] || [ "$CODE" = "201" ]; then
      echo "  ✅ Uploaded $path"
    else
      echo "  ⚠️  Upload $path returned HTTP $CODE"
    fi
  else
    echo "  ✅ $path already cached by Netlify"
  fi
}

upload_if_required "$SHA1_HTML" "/index.html"  "$HTML_FILE"
upload_if_required "$SHA1_HDR"  "/_headers"    "$HEADERS_FILE"

echo "✅ DEPLOYED! Opening site..."
open "https://pepassure.com"
echo ""
echo "  🌐 https://pepassure.com"
echo "═══════════════════════════════════════════"

echo ""
read -rp "Press Enter to close..."
