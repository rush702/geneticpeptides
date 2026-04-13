#!/bin/bash
# ================================================================
# PepAssure — One-Click Deploy
# ================================================================
set -e
cd "$(dirname "$0")"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║   PepAssure — Deploy to pepassure.com ║${NC}"
echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════╝${NC}"
echo ""

SUPABASE_URL="https://atyaqyotrntnfchhdzvw.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_fQsKvj_UW2Zwcjt0_bb1Tg_Dhjedkht"
SITE_NAME="gleeful-cendol-e067e4"
TOKEN="nfp_CeCPZhrVWqbWRzeAhpmAkoMgcmg7HB4443f5"

echo "$TOKEN" > "$HOME/.netlify_token"
chmod 600 "$HOME/.netlify_token"

# Resolve site UUID from site name
echo -e "${BOLD}Resolving Netlify site ID...${NC}"
SITE_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.netlify.com/api/v1/sites?name=$SITE_NAME&per_page=100" | \
  python3 -c "
import json, sys
sites = json.load(sys.stdin)
for s in sites:
    if s.get('name') == '$SITE_NAME':
        print(s.get('site_id') or s.get('id'))
        sys.exit(0)
")
if [ -z "$SITE_ID" ]; then
  echo -e "${RED}✗ Could not find site '$SITE_NAME' in your Netlify account${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Site ID: $SITE_ID"

# Build
OUT="pepassure_deploy"
rm -rf "$OUT" && mkdir -p "$OUT"

if [ -f "pepassure_homepage_v2.html" ]; then HOMESRC="pepassure_homepage_v2.html"; else HOMESRC="pepassure_homepage.html"; fi
if [ -f "pepassure_for_vendors_v2.html" ]; then VENDSRC="pepassure_for_vendors_v2.html"; else VENDSRC="pepassure_for_vendors.html"; fi

cp "$HOMESRC" "$OUT/index.html"
cp "$VENDSRC" "$OUT/for-vendors.html"

for f in "$OUT/index.html" "$OUT/for-vendors.html"; do
  sed -i '' -e "s|%%SUPABASE_URL%%|$SUPABASE_URL|g" -e "s|%%SUPABASE_ANON_KEY%%|$SUPABASE_ANON_KEY|g" "$f"
done
echo -e "${GREEN}✓${NC} Built $HOMESRC + $VENDSRC with Supabase credentials"

if grep -q "%%SUPABASE" "$OUT/index.html" "$OUT/for-vendors.html"; then
  echo -e "${RED}✗ Placeholder still present${NC}"; exit 1
fi

cat > "$OUT/_headers" << 'EOF'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self' https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com https://js.stripe.com; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co;
EOF

cat > "$OUT/_redirects" << 'EOF'
/for-vendors    /for-vendors.html   200
/vendors        /for-vendors.html   301
EOF

# Deploy
echo ""
echo -e "${BOLD}Zipping + uploading to Netlify...${NC}"
ZIP="/tmp/pepassure_deploy_$(date +%s).zip"
(cd "$OUT" && zip -q -r "$ZIP" .)
echo -e "${GREEN}✓${NC} Zip: $(du -sh "$ZIP" | cut -f1)"

deploy_attempt() {
  local label="$1"; local qs="$2"
  echo ""
  echo -e "${BOLD}→ Attempt: $label${NC}"
  HTTP=$(curl -s -o /tmp/pepassure_deploy_resp.json -w "%{http_code}" \
    -X POST "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys$qs" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/zip" \
    --data-binary "@$ZIP")
  echo "  HTTP $HTTP"
  [ "$HTTP" = "200" ] || [ "$HTTP" = "201" ]
}

SUCCESS=0
if deploy_attempt "PRODUCTION" ""; then SUCCESS=1; MODE="production";
elif deploy_attempt "DRAFT" "?draft=true"; then SUCCESS=1; MODE="draft"; fi
rm -f "$ZIP"

if [ "$SUCCESS" = "1" ]; then
  DEPLOY_URL=$(python3 -c "import json; d=json.load(open('/tmp/pepassure_deploy_resp.json')); print(d.get('deploy_ssl_url') or d.get('ssl_url') or 'https://pepassure.com')" 2>/dev/null || echo "https://pepassure.com")
  echo ""
  echo -e "${BOLD}${GREEN}╔═══════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${GREEN}║   ✅ DEPLOYED ($MODE)                  ║${NC}"
  echo -e "${BOLD}${GREEN}╚═══════════════════════════════════════╝${NC}"
  echo ""
  if [ "$MODE" = "production" ]; then
    echo -e "  ${CYAN}→${NC} Homepage:  https://pepassure.com"
    echo -e "  ${CYAN}→${NC} Vendors:   https://pepassure.com/for-vendors"
    open "https://pepassure.com/for-vendors" 2>/dev/null || true
  else
    echo -e "  ${CYAN}→${NC} Preview:   $DEPLOY_URL"
    echo -e "  ${CYAN}→${NC} Vendors:   $DEPLOY_URL/for-vendors"
    open "$DEPLOY_URL/for-vendors" 2>/dev/null || true
  fi
  echo -e "  ${CYAN}→${NC} Full URL:  $DEPLOY_URL"
  echo ""
else
  echo -e "${RED}✗ Both production and draft deploys failed${NC}"
  echo "Last response:"
  cat /tmp/pepassure_deploy_resp.json
fi

echo ""
read -rp "Press Enter to close..."
