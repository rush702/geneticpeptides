#!/bin/bash
# PeptideRank — Next.js → Vercel deploy
# Double-click this file on your Mac to install deps and push to Vercel.

set -e

PROJECT_DIR="/Users/joshuarush/Documents/Claude/Projects/new co"

osascript -e 'display notification "Starting PeptideRank deploy..." with title "PeptideRank"'

cd "$PROJECT_DIR" || {
  osascript -e 'display dialog "Could not find project folder at:\n'"$PROJECT_DIR"'" buttons {"OK"} with title "PeptideRank Deploy — Error"'
  exit 1
}

# 1. Ensure Node.js is available
if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display dialog "Node.js is not installed.\n\nInstall from https://nodejs.org (LTS version), then run this script again." buttons {"OK"} with title "PeptideRank Deploy"'
  open "https://nodejs.org"
  exit 1
fi

# 2. Install project dependencies (clean install to pick up package.json updates)
echo "▶ Clearing stale dependencies..."
rm -rf node_modules package-lock.json .next
echo "▶ Installing dependencies..."
npm install

# 3. Run a local build to catch errors before pushing
echo "▶ Running production build..."
if ! npm run build; then
  osascript -e 'display dialog "Local build failed. Check the terminal for errors — fix them before deploying." buttons {"OK"} with title "PeptideRank Deploy — Build Failed"'
  exit 1
fi

# 4. Ensure Vercel CLI is installed
if ! command -v vercel >/dev/null 2>&1; then
  echo "▶ Installing Vercel CLI..."
  npm install -g vercel
fi

# 5. Deploy to production
echo "▶ Deploying to Vercel (production)..."
DEPLOY_URL=$(vercel --prod --yes 2>&1 | tee /tmp/peptiderank_deploy.log | grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1)

if [[ -n "$DEPLOY_URL" ]]; then
  echo "$DEPLOY_URL" | pbcopy
  CHOICE=$(osascript -e "display dialog \"🎉 PeptideRank is LIVE!\n\nURL (copied to clipboard):\n$DEPLOY_URL\" buttons {\"Open Site\", \"Close\"} default button \"Open Site\" with title \"PeptideRank Deploy\"")
  if [[ "$CHOICE" == *"Open Site"* ]]; then
    open "$DEPLOY_URL"
  fi
else
  osascript -e 'display dialog "Deployment finished but no URL was captured. Check /tmp/peptiderank_deploy.log" buttons {"OK"} with title "PeptideRank Deploy"'
fi
