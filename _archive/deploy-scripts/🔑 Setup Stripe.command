#!/bin/bash
# PepAssure — Stripe Payment Links Setup
# Grab your secret key from: https://dashboard.stripe.com/apikeys

clear
echo "═══════════════════════════════════════════════════"
echo "  🔑 PepAssure · Stripe Payment Links Setup"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  You need your Stripe SECRET key."
echo "  Get it at: https://dashboard.stripe.com/apikeys"
echo ""
echo "  It starts with  sk_live_...  (live mode)"
echo "              or  sk_test_...  (test mode)"
echo ""
read -rp "  Paste your Stripe secret key: " STRIPE_KEY
echo ""

if [[ -z "$STRIPE_KEY" ]]; then
  echo "❌ No key entered. Exiting."
  read -rp "Press Enter to close..."; exit 1
fi

# Quick validation
if [[ "$STRIPE_KEY" != sk_* ]]; then
  echo "❌ That doesn't look like a Stripe secret key (should start with sk_)."
  read -rp "Press Enter to close..."; exit 1
fi

MODE="LIVE"
[[ "$STRIPE_KEY" == sk_test_* ]] && MODE="TEST"
echo "  Mode: $MODE"
echo ""

SITE_FILE="/Users/joshuarush/Documents/Claude/Projects/new co/peptideverify_website.html"

# ── Helper ──────────────────────────────────────────────────────────────────
stripe_post() {
  curl -s -X POST "https://api.stripe.com/$1" \
    -u "$STRIPE_KEY:" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "$2" \
    --data-urlencode "$3" \
    --data-urlencode "$4" \
    --data-urlencode "$5"
}

extract() { python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$1','') or d.get('error',{}).get('message',''))" 2>/dev/null; }

# ── Create Product ───────────────────────────────────────────────────────────
echo "📦 Creating products..."

PRO_PROD=$(curl -s -X POST "https://api.stripe.com/v1/products" \
  -u "$STRIPE_KEY:" \
  --data-urlencode "name=PepAssure Pro Vendor" \
  --data-urlencode "description=Verified listing, claimed profile, response tools, and analytics for growing peptide vendors" | extract "id")

ENT_PROD=$(curl -s -X POST "https://api.stripe.com/v1/products" \
  -u "$STRIPE_KEY:" \
  --data-urlencode "name=PepAssure Enterprise" \
  --data-urlencode "description=Full API access, white-label COA display, dedicated account manager, custom data integrations" | extract "id")

if [[ -z "$PRO_PROD" || -z "$ENT_PROD" ]]; then
  echo "❌ Failed to create products. Check your API key."
  read -rp "Press Enter to close..."; exit 1
fi

echo "   ✅ Pro product:        $PRO_PROD"
echo "   ✅ Enterprise product: $ENT_PROD"
echo ""

# ── Create Prices ────────────────────────────────────────────────────────────
echo "💲 Creating prices..."

PRO_MO_PRICE=$(curl -s -X POST "https://api.stripe.com/v1/prices" \
  -u "$STRIPE_KEY:" \
  --data-urlencode "product=$PRO_PROD" \
  --data-urlencode "unit_amount=19900" \
  --data-urlencode "currency=usd" \
  --data-urlencode "recurring[interval]=month" \
  --data-urlencode "nickname=Pro Monthly" | extract "id")

PRO_AN_PRICE=$(curl -s -X POST "https://api.stripe.com/v1/prices" \
  -u "$STRIPE_KEY:" \
  --data-urlencode "product=$PRO_PROD" \
  --data-urlencode "unit_amount=190800" \
  --data-urlencode "currency=usd" \
  --data-urlencode "recurring[interval]=year" \
  --data-urlencode "nickname=Pro Annual (\$159/mo)" | extract "id")

ENT_MO_PRICE=$(curl -s -X POST "https://api.stripe.com/v1/prices" \
  -u "$STRIPE_KEY:" \
  --data-urlencode "product=$ENT_PROD" \
  --data-urlencode "unit_amount=59900" \
  --data-urlencode "currency=usd" \
  --data-urlencode "recurring[interval]=month" \
  --data-urlencode "nickname=Enterprise Monthly" | extract "id")

ENT_AN_PRICE=$(curl -s -X POST "https://api.stripe.com/v1/prices" \
  -u "$STRIPE_KEY:" \
  --data-urlencode "product=$ENT_PROD" \
  --data-urlencode "unit_amount=574800" \
  --data-urlencode "currency=usd" \
  --data-urlencode "recurring[interval]=year" \
  --data-urlencode "nickname=Enterprise Annual (\$479/mo)" | extract "id")

echo "   ✅ Pro Monthly:        $PRO_MO_PRICE"
echo "   ✅ Pro Annual:         $PRO_AN_PRICE"
echo "   ✅ Enterprise Monthly: $ENT_MO_PRICE"
echo "   ✅ Enterprise Annual:  $ENT_AN_PRICE"
echo ""

# ── Create Payment Links ─────────────────────────────────────────────────────
echo "🔗 Creating payment links..."

create_link() {
  curl -s -X POST "https://api.stripe.com/v1/payment_links" \
    -u "$STRIPE_KEY:" \
    --data-urlencode "line_items[0][price]=$1" \
    --data-urlencode "line_items[0][quantity]=1" \
    --data-urlencode "after_completion[type]=redirect" \
    --data-urlencode "after_completion[redirect][url]=https://pepassure.com?checkout=success" | extract "url"
}

PRO_MO_URL=$(create_link "$PRO_MO_PRICE")
PRO_AN_URL=$(create_link "$PRO_AN_PRICE")
ENT_MO_URL=$(create_link "$ENT_MO_PRICE")
ENT_AN_URL=$(create_link "$ENT_AN_PRICE")

if [[ -z "$PRO_MO_URL" || -z "$PRO_AN_URL" || -z "$ENT_MO_URL" || -z "$ENT_AN_URL" ]]; then
  echo "❌ Failed to create payment links."
  echo "   Pro Monthly:  $PRO_MO_URL"
  echo "   Pro Annual:   $PRO_AN_URL"
  echo "   Ent Monthly:  $ENT_MO_URL"
  echo "   Ent Annual:   $ENT_AN_URL"
  read -rp "Press Enter to close..."; exit 1
fi

echo "   ✅ Pro Monthly:        $PRO_MO_URL"
echo "   ✅ Pro Annual:         $PRO_AN_URL"
echo "   ✅ Enterprise Monthly: $ENT_MO_URL"
echo "   ✅ Enterprise Annual:  $ENT_AN_URL"
echo ""

# ── Patch website file ───────────────────────────────────────────────────────
echo "✏️  Patching website..."

if [[ ! -f "$SITE_FILE" ]]; then
  echo "❌ Website file not found at: $SITE_FILE"
  read -rp "Press Enter to close..."; exit 1
fi

sed -i '' \
  "s|https://buy.stripe.com/REPLACE_PRO_MONTHLY|$PRO_MO_URL|g" \
  "$SITE_FILE"
sed -i '' \
  "s|https://buy.stripe.com/REPLACE_PRO_ANNUAL|$PRO_AN_URL|g" \
  "$SITE_FILE"
sed -i '' \
  "s|https://buy.stripe.com/REPLACE_ENT_MONTHLY|$ENT_MO_URL|g" \
  "$SITE_FILE"
sed -i '' \
  "s|https://buy.stripe.com/REPLACE_ENT_ANNUAL|$ENT_AN_URL|g" \
  "$SITE_FILE"

echo "   ✅ Website patched"
echo ""

# ── Redeploy ─────────────────────────────────────────────────────────────────
echo "🚀 Redeploying to pepassure.com..."

TOKEN="nfp_ZaJ6m4nE1ddGpB7ZpnPHxv2HpD2etjpBf2d9"
DEPLOY_DIR="/Users/joshuarush/Documents/Claude/Projects/new co/deploy"
DEPLOY_ZIP="/tmp/pepassure_stripe_$(date +%s).zip"

cp "$SITE_FILE" "$DEPLOY_DIR/index.html"
cd "$DEPLOY_DIR" && zip -j "$DEPLOY_ZIP" index.html && cd ..

RESULT=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.netlify.com/api/v1/sites/851035d7-ae0c-43c8-a62b-df5d4edc58a0/deploys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary "@$DEPLOY_ZIP")

HTTP_CODE=$(echo "$RESULT" | tail -1)
rm -f "$DEPLOY_ZIP"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "   ✅ Deployed!"
else
  echo "   ⚠️  Deploy returned HTTP $HTTP_CODE — you may need to run 🚀 Deploy NOW.command separately"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  🎉 Stripe is live on pepassure.com!"
echo ""
echo "  Mode: $MODE"
echo "  Pro Monthly:        $PRO_MO_URL"
echo "  Pro Annual:         $PRO_AN_URL"
echo "  Enterprise Monthly: $ENT_MO_URL"
echo "  Enterprise Annual:  $ENT_AN_URL"
echo "═══════════════════════════════════════════════════"
echo ""
read -rp "Press Enter to close..."
