#!/bin/bash
# ================================================================
# PepAssure — One-Click Deploy Script
# Double-click this file to build + deploy pepassure.com
# ================================================================

set -e
cd "$(dirname "$0")"

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║   PepAssure — Deploy to pepassure.com ║${NC}"
echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════╝${NC}"
echo ""

# ── 1. Check dependencies ────────────────────────────────────────
check_dep() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}✗ '$1' not found.${NC} Install with: $2"
    exit 1
  fi
}
check_dep "netlify" "npm install -g netlify-cli"
check_dep "sed"     "built-in on macOS"
echo -e "${GREEN}✓ Dependencies OK${NC}"

# ── 2. Get / cache Supabase credentials ─────────────────────────
CREDS_FILE=".pepassure_creds"

if [ -f "$CREDS_FILE" ]; then
  source "$CREDS_FILE"
  echo -e "${GREEN}✓ Loaded saved Supabase credentials${NC}"
else
  echo ""
  echo -e "${YELLOW}━━━ Supabase Credentials ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo    "  Find these in: Supabase Dashboard → Settings → API"
  echo ""
  read -rp "  Supabase Project URL (https://xxx.supabase.co): " SUPABASE_URL
  read -rp "  Supabase Anon Key (eyJ...): " SUPABASE_ANON_KEY

  if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}✗ Both credentials are required.${NC}"
    exit 1
  fi

  # Save for next run
  echo "SUPABASE_URL=\"$SUPABASE_URL\""           > "$CREDS_FILE"
  echo "SUPABASE_ANON_KEY=\"$SUPABASE_ANON_KEY\"" >> "$CREDS_FILE"
  chmod 600 "$CREDS_FILE"
  echo -e "${GREEN}✓ Credentials saved to $CREDS_FILE (gitignored)${NC}"
fi

# ── 3. Build output directory ────────────────────────────────────
OUT="pepassure_deploy"
rm -rf "$OUT"
mkdir -p "$OUT"

echo ""
echo -e "${BOLD}Building site...${NC}"

# Copy source HTML files
cp pepassure_homepage.html   "$OUT/index.html"
cp pepassure_for_vendors_v2.html "$OUT/for-vendors.html"

# Inject Supabase credentials into both HTML files
for f in "$OUT/index.html" "$OUT/for-vendors.html"; do
  sed -i '' \
    -e "s|%%SUPABASE_URL%%|$SUPABASE_URL|g" \
    -e "s|%%SUPABASE_ANON_KEY%%|$SUPABASE_ANON_KEY|g" \
    "$f"
  echo -e "  ${GREEN}✓${NC} Injected credentials → $(basename $f)"
done

# Copy any additional assets if present
[ -d "assets" ] && cp -r assets "$OUT/assets" && echo -e "  ${GREEN}✓${NC} Copied assets"

# Netlify headers
cat > "$OUT/_headers" << 'EOF'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self' https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com https://js.stripe.com; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co;

/for-vendors.html
  Cache-Control: no-cache

/index.html
  Cache-Control: no-cache
EOF
echo -e "  ${GREEN}✓${NC} Security headers written"

# Netlify redirect — /for-vendors → for-vendors.html
cat > "$OUT/_redirects" << 'EOF'
/for-vendors    /for-vendors.html   200
/vendors        /for-vendors.html   301
EOF
echo -e "  ${GREEN}✓${NC} Redirects written"

echo -e "${GREEN}✓ Build complete → ./$OUT/${NC}"

# ── 4. Verify injection worked ────────────────────────────────────
if grep -q "%%SUPABASE_URL%%" "$OUT/index.html"; then
  echo -e "${RED}✗ Credential injection failed — placeholder still found in index.html${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Credential injection verified${NC}"

# ── 5. Deploy to Netlify ──────────────────────────────────────────
echo ""
echo -e "${BOLD}Deploying to Netlify...${NC}"

# Check for existing site ID
if [ -f ".netlify/state.json" ]; then
  echo -e "  ${GREEN}✓${NC} Using existing Netlify site"
  netlify deploy --prod --dir="$OUT" --message="PepAssure deploy $(date '+%Y-%m-%d %H:%M')"
else
  echo -e "  ${YELLOW}→${NC} No Netlify site linked yet — running first-time setup"
  netlify deploy --prod --dir="$OUT" --message="PepAssure initial deploy"
fi

echo ""
echo -e "${BOLD}${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║   ✅ pepassure.com deployed!           ║${NC}"
echo -e "${BOLD}${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}→ Site:${NC}     https://pepassure.com"
echo -e "  ${CYAN}→ Vendors:${NC}  https://pepassure.com/for-vendors"
echo ""
echo -e "  ${YELLOW}Next steps:${NC}"
echo    "  1. Run SUPABASE_COMPLETE_SETUP.sql in your Supabase SQL Editor"
echo    "  2. Set Supabase Auth → Site URL: https://pepassure.com"
echo    "  3. Claim submissions appear in: Supabase → Table Editor → claim_requests"
echo ""

read -rp "Press Enter to close..."
