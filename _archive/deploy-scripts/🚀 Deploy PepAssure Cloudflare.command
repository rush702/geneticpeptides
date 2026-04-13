#!/bin/bash
set -e
cd "$(dirname "$0")"

# === Config ===
export CLOUDFLARE_API_TOKEN="cfut_Azqnv8dhaD0a3q6omqMOVs3ppbC6cOt46CQMpsEna3f33669"
SUPABASE_URL="https://atyaqyotrntnfchhdzvw.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_fQsKvj_UW2Zwcjt0_bb1Tg_Dhjedkht"
PROJECT_NAME="pepassure"

# === Colors ===
BOLD='\033[1m'; CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[0;33m'; NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║  PepAssure → Cloudflare Pages          ║${NC}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# === Sanity: check token format ===
echo -e "  ${CYAN}→${NC} Token prefix: ${CLOUDFLARE_API_TOKEN:0:6}..."
echo -e "  ${CYAN}→${NC} Project:      $PROJECT_NAME"
echo ""

# === Verify token with CF API ===
echo -e "${BOLD}Verifying Cloudflare token...${NC}"
VERIFY=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/user/tokens/verify")
if echo "$VERIFY" | grep -q '"success":true'; then
  echo -e "  ${GREEN}✓${NC} Token valid"
else
  echo -e "  ${RED}✗ Token rejected by Cloudflare${NC}"
  echo "$VERIFY" | python3 -m json.tool 2>/dev/null || echo "$VERIFY"
  echo ""
  echo -e "${YELLOW}The token may have the wrong format or permissions.${NC}"
  echo -e "Expected a Cloudflare API token (starts with a long hash, not 'cfut_')."
  read -rp "Press Enter to close..."
  exit 1
fi

# === Fetch account ID ===
echo ""
echo -e "${BOLD}Fetching account ID...${NC}"
ACCT_JSON=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts")
ACCOUNT_ID=$(echo "$ACCT_JSON" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success') and d.get('result'):
    print(d['result'][0]['id'])
" 2>/dev/null)

if [ -z "$ACCOUNT_ID" ]; then
  echo -e "  ${RED}✗ Could not list accounts${NC}"
  echo "$ACCT_JSON" | python3 -m json.tool 2>/dev/null | head -20
  read -rp "Press Enter to close..."
  exit 1
fi
echo -e "  ${GREEN}✓${NC} Account: $ACCOUNT_ID"
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"

# === Build output directory ===
echo ""
echo -e "${BOLD}Building site...${NC}"
OUT="pepassure_deploy"
rm -rf "$OUT" && mkdir -p "$OUT"

if [ -f "pepassure_homepage_v2.html" ]; then HOMESRC="pepassure_homepage_v2.html"; else HOMESRC="pepassure_homepage.html"; fi
if [ -f "pepassure_for_vendors_v2.html" ]; then VENDSRC="pepassure_for_vendors_v2.html"; else VENDSRC="pepassure_for_vendors.html"; fi

cp "$HOMESRC" "$OUT/index.html"
cp "$VENDSRC" "$OUT/for-vendors.html"
echo -e "  ${GREEN}✓${NC} Copied $HOMESRC → index.html"
echo -e "  ${GREEN}✓${NC} Copied $VENDSRC → for-vendors.html"

# Phase 2a: auth pages
if [ -f "pepassure_login.html" ]; then
  cp "pepassure_login.html" "$OUT/login.html"
  echo -e "  ${GREEN}✓${NC} Copied pepassure_login.html → login.html"
fi
if [ -f "pepassure_dashboard.html" ]; then
  cp "pepassure_dashboard.html" "$OUT/dashboard.html"
  echo -e "  ${GREEN}✓${NC} Copied pepassure_dashboard.html → dashboard.html"
fi
# Phase 2b: admin
if [ -f "pepassure_admin.html" ]; then
  cp "pepassure_admin.html" "$OUT/admin.html"
  echo -e "  ${GREEN}✓${NC} Copied pepassure_admin.html → admin.html"
fi
# Vendor profile page
if [ -f "pepassure_vendor_profile.html" ]; then
  cp "pepassure_vendor_profile.html" "$OUT/vendor.html"
  echo -e "  ${GREEN}✓${NC} Copied pepassure_vendor_profile.html → vendor.html"
fi
# Historical trends mockup
if [ -f "pepassure_historical_trends_mockup.html" ]; then
  cp "pepassure_historical_trends_mockup.html" "$OUT/vendor-trends.html"
  echo -e "  ${GREEN}✓${NC} Copied pepassure_historical_trends_mockup.html → vendor-trends.html"
fi

# Inject Supabase credentials into every HTML file in the build
for f in "$OUT"/*.html; do
  [ -f "$f" ] && sed -i '' -e "s|%%SUPABASE_URL%%|$SUPABASE_URL|g" -e "s|%%SUPABASE_ANON_KEY%%|$SUPABASE_ANON_KEY|g" "$f"
done
echo -e "  ${GREEN}✓${NC} Credentials injected"

# _redirects for clean URLs (CF Pages respects Netlify-style _redirects)
cat > "$OUT/_redirects" <<'EOF'
/for-vendors    /for-vendors.html   200
/vendors        /for-vendors.html   301
/login          /login.html         200
/dashboard      /dashboard.html     200
/admin          /admin.html         200
/vendor         /vendor.html        200
/vendor/*       /vendor.html        200
/vendor-trends  /vendor-trends.html 200
EOF
echo -e "  ${GREEN}✓${NC} _redirects written"

# === Check/create Pages project (permissive) ===
echo ""
echo -e "${BOLD}Ensuring Pages project exists...${NC}"
PROJ=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME")
if echo "$PROJ" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if (d.get('result') or {}).get('name')=='$PROJECT_NAME' else 1)" 2>/dev/null; then
  echo -e "  ${GREEN}✓${NC} Project '$PROJECT_NAME' exists"
else
  echo -e "  ${CYAN}→${NC} Creating project '$PROJECT_NAME'..."
  CREATE=$(curl -s -X POST \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$PROJECT_NAME\",\"production_branch\":\"main\"}" \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects")
  if echo "$CREATE" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if (d.get('result') or {}).get('name')=='$PROJECT_NAME' else 1)" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Created"
  else
    # Maybe it already exists (race / conflict). Check again.
    PROJ2=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME")
    if echo "$PROJ2" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if (d.get('result') or {}).get('name')=='$PROJECT_NAME' else 1)" 2>/dev/null; then
      echo -e "  ${GREEN}✓${NC} Project already exists (verified on retry)"
    else
      echo -e "  ${RED}✗ Failed to create project${NC}"
      echo "$CREATE" | python3 -m json.tool 2>/dev/null | head -30
      read -rp "Press Enter to close..."
      exit 1
    fi
  fi
fi

# === Deploy via Cloudflare direct-upload API (pure Python, no wrangler) ===
echo ""
echo -e "${BOLD}Deploying via Cloudflare direct-upload API...${NC}"

python3 <<PYEOF
import os, sys, json, base64, hashlib, urllib.request, urllib.error, mimetypes, pathlib

TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]
ACCT  = os.environ["CLOUDFLARE_ACCOUNT_ID"]
PROJ  = "${PROJECT_NAME}"
ROOT  = pathlib.Path("${OUT}").resolve()

def req(method, url, body=None, headers=None, raw=False):
    data = None
    h = {"Authorization": f"Bearer {TOKEN}"}
    if headers: h.update(headers)
    if body is not None and not raw:
        data = json.dumps(body).encode()
        h["Content-Type"] = "application/json"
    elif raw:
        data = body
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} on {method} {url}")
        try:
            print(f"  Body: {e.read().decode()[:500]}")
        except: pass
        raise

# 1. Get upload JWT
print("  → Getting upload JWT...")
jwt_resp = req("GET", f"https://api.cloudflare.com/client/v4/accounts/{ACCT}/pages/projects/{PROJ}/upload-token")
jwt = jwt_resp["result"]["jwt"]
print(f"  ✓ JWT obtained")

# 2. Walk files, hash each. CF uses: first 28 hex chars of sha256(content + ext)
files = []
manifest = {}
for p in ROOT.rglob("*"):
    if not p.is_file(): continue
    rel = "/" + str(p.relative_to(ROOT)).replace(os.sep, "/")
    content = p.read_bytes()
    ext = p.suffix.lstrip(".")
    # CF hash algorithm: sha256(content + ext)[:32]
    h = hashlib.sha256(content + ext.encode()).hexdigest()[:32]
    ct, _ = mimetypes.guess_type(p.name)
    files.append({"rel": rel, "hash": h, "content": content, "ct": ct or "application/octet-stream"})
    manifest[rel] = h

print(f"  ✓ {len(files)} files hashed")

# 3. Check which hashes are missing
print("  → Checking missing assets...")
check = req("POST",
    "https://api.cloudflare.com/client/v4/pages/assets/check-missing",
    body={"hashes": [f["hash"] for f in files]},
    headers={"Authorization": f"Bearer {jwt}"})
missing = set(check["result"])
print(f"  ✓ {len(missing)} of {len(files)} need upload")

# 4. Upload missing files
to_upload = [f for f in files if f["hash"] in missing]
if to_upload:
    print("  → Uploading assets...")
    payload = [{
        "key": f["hash"],
        "value": base64.b64encode(f["content"]).decode(),
        "metadata": {"contentType": f["ct"]},
        "base64": True,
    } for f in to_upload]
    upl = req("POST",
        "https://api.cloudflare.com/client/v4/pages/assets/upload",
        body=payload,
        headers={"Authorization": f"Bearer {jwt}"})
    if not upl.get("success"):
        print(f"  ✗ Upload failed: {upl}")
        sys.exit(1)
    print(f"  ✓ Uploaded {len(to_upload)} assets")

# 5. Finalize deployment directly in Python with hand-built multipart
print("  → Finalizing deployment...")
import uuid
boundary = "----CFDeploy" + uuid.uuid4().hex
manifest_json = json.dumps(manifest)

parts = []
parts.append(f"--{boundary}\r\n".encode())
parts.append(b'Content-Disposition: form-data; name="manifest"\r\n')
parts.append(b"Content-Type: application/json\r\n\r\n")
parts.append(manifest_json.encode())
parts.append(b"\r\n")
parts.append(f"--{boundary}\r\n".encode())
parts.append(b'Content-Disposition: form-data; name="branch"\r\n\r\n')
parts.append(b"main\r\n")
parts.append(f"--{boundary}--\r\n".encode())
body = b"".join(parts)

deploy_url = f"https://api.cloudflare.com/client/v4/accounts/{ACCT}/pages/projects/{PROJ}/deployments"
r = urllib.request.Request(
    deploy_url,
    data=body,
    headers={
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    },
    method="POST",
)
try:
    with urllib.request.urlopen(r, timeout=120) as resp:
        dep = json.loads(resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"  ✗ Deploy HTTP {e.code}: {e.read().decode()[:800]}")
    sys.exit(1)

if not dep.get("success"):
    print(f"  ✗ Deploy failed: {json.dumps(dep)[:800]}")
    sys.exit(1)

result_url = dep["result"]["url"]
print(f"  ✓ Deployed: {result_url}")
with open("/tmp/cf_deploy_url.txt", "w") as f:
    f.write(result_url)
PYEOF

PY_STATUS=$?
if [ "$PY_STATUS" != "0" ]; then
  echo -e "${RED}✗ Python deploy step failed${NC}"
  read -rp "Press Enter to close..."
  exit 1
fi

DEPLOY_URL=$(cat /tmp/cf_deploy_url.txt 2>/dev/null)
if [ -z "$DEPLOY_URL" ]; then
  echo -e "  ${RED}✗ No deploy URL captured${NC}"
  read -rp "Press Enter to close..."
  exit 1
fi

echo -e "  ${GREEN}✓${NC} Deployment created: $DEPLOY_URL"

echo ""
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║   ✅ DEPLOYED to Cloudflare Pages       ║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}→${NC} Deploy URL: $DEPLOY_URL"
echo -e "  ${CYAN}→${NC} Project:    https://$PROJECT_NAME.pages.dev"
echo -e "  ${CYAN}→${NC} Vendors:    https://$PROJECT_NAME.pages.dev/for-vendors"
echo ""
echo -e "${YELLOW}Next step:${NC} Add pepassure.com as custom domain in the CF Pages dashboard."
open "$DEPLOY_URL" 2>/dev/null || true
echo ""
read -rp "Press Enter to close..."
