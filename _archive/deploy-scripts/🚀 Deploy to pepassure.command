#!/bin/bash
# ─────────────────────────────────────────────────────────
#  PepAssure — Deploy to Netlify via CLI
#  Double-click this file in Finder to deploy.
# ─────────────────────────────────────────────────────────

cd "/Users/joshuarush/Documents/Claude/Projects/new co" || exit 1

echo "═══════════════════════════════════════════════"
echo "  🚀 PepAssure — Deploying to pepassure.com"
echo "═══════════════════════════════════════════════"
echo ""

# Check if node/npm available
if ! command -v npm &>/dev/null; then
  echo "❌ npm not found. Installing Node via Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  brew install node
fi

# Install Netlify CLI if needed
if ! command -v netlify &>/dev/null; then
  echo "📦 Installing Netlify CLI..."
  npm install -g netlify-cli
fi

echo ""
echo "✅ Netlify CLI ready."
echo ""

# Set up deploy folder (index.html = homepage)
DEPLOY_DIR="/Users/joshuarush/Documents/Claude/Projects/new co/deploy"
mkdir -p "$DEPLOY_DIR"
cp "/Users/joshuarush/Documents/Claude/Projects/new co/peptideverify_website.html" "$DEPLOY_DIR/index.html"

echo "📁 Deploy folder ready: $DEPLOY_DIR"
echo "📄 File: index.html ($(wc -c < "$DEPLOY_DIR/index.html") bytes)"
echo ""
echo "🔐 Logging in to Netlify (browser will open)..."
echo ""

# Login (opens browser — you'll be prompted to authorize)
netlify login

echo ""
echo "🚀 Deploying to site gleeful-cendol-e067e4 (pepassure.com)..."
echo ""

# Deploy to production
netlify deploy \
  --prod \
  --dir="$DEPLOY_DIR" \
  --site=gleeful-cendol-e067e4 \
  --message="PepAssure v2 — monetization + Finnrick integration"

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ Done! Visit https://pepassure.com"
echo "═══════════════════════════════════════════════"
echo ""
read -p "Press Enter to close..."
