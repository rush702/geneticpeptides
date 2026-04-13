#!/bin/bash
# ================================================================
# Attach pepassure.com as custom domain on Cloudflare Pages
# ================================================================
set -e
cd "$(dirname "$0")"

export CLOUDFLARE_API_TOKEN="cfut_Azqnv8dhaD0a3q6omqMOVs3ppbC6cOt46CQMpsEna3f33669"
PROJECT_NAME="pepassure"
DOMAIN="pepassure.com"
WWW_DOMAIN="www.pepassure.com"

BOLD='\033[1m'; CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[0;33m'; NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║  Attach pepassure.com → CF Pages       ║${NC}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# Get account ID
ACCOUNT_ID=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(d['result'][0]['id'] if d.get('success') else '')
")
if [ -z "$ACCOUNT_ID" ]; then
  echo -e "${RED}✗ Could not fetch account ID${NC}"
  read -rp "Press Enter to close..."
  exit 1
fi
echo -e "${GREEN}✓${NC} Account: $ACCOUNT_ID"

attach_domain() {
  local d="$1"
  echo ""
  echo -e "${BOLD}Attaching $d...${NC}"
  RESP=$(curl -s -X POST \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$d\"}" \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains")
  echo "$RESP" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if d.get('success'):
    r=d.get('result',{})
    print('  ${GREEN}✓${NC} Attached:', r.get('name'), '-- status:', r.get('status','unknown'))
    vd=r.get('validation_data') or {}
    if vd: print('     validation:', json.dumps(vd))
else:
    errs=d.get('errors',[])
    already=any('already exists' in (e.get('message','').lower()) or e.get('code')==8000050 for e in errs)
    if already:
        print('  ${YELLOW}→${NC} Already attached')
    else:
        print('  ${RED}✗${NC} Error:', json.dumps(errs))
"
}

attach_domain "$DOMAIN"
attach_domain "$WWW_DOMAIN"

echo ""
echo -e "${BOLD}Fetching domain status...${NC}"
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if d.get('success'):
    for dom in d.get('result',[]):
        print(f\"  • {dom.get('name')} — status: {dom.get('status')} — cert: {dom.get('certificate_authority','?')}\")
        vd=dom.get('validation_data')
        if vd and vd.get('status')!='active':
            print(f'     validation: {json.dumps(vd)}')
else:
    print('  could not list domains')
"

# Check if pepassure.com is on CF DNS (i.e. is the zone in this account?)
echo ""
echo -e "${BOLD}Checking if pepassure.com zone is on Cloudflare...${NC}"
ZONE_RESP=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN")
ZONE_ID=$(echo "$ZONE_RESP" | python3 -c "
import json,sys
d=json.load(sys.stdin)
r=d.get('result') or []
print(r[0]['id'] if r else '')
")

if [ -n "$ZONE_ID" ]; then
  echo -e "  ${GREEN}✓${NC} Zone is on Cloudflare: $ZONE_ID"
  echo -e "  ${CYAN}→${NC} CNAMEs/records should auto-provision."
else
  echo -e "  ${YELLOW}⚠${NC}  Zone NOT on Cloudflare."
  echo ""
  echo -e "  ${BOLD}Manual DNS required:${NC} At your current DNS host (where pepassure.com lives now),"
  echo -e "  set these records:"
  echo ""
  echo -e "    ${CYAN}Type:${NC}  CNAME"
  echo -e "    ${CYAN}Name:${NC}  @  (apex / pepassure.com)"
  echo -e "    ${CYAN}Value:${NC} pepassure.pages.dev"
  echo ""
  echo -e "    ${CYAN}Type:${NC}  CNAME"
  echo -e "    ${CYAN}Name:${NC}  www"
  echo -e "    ${CYAN}Value:${NC} pepassure.pages.dev"
  echo ""
  echo -e "  If your DNS host does not support CNAME at apex, use ALIAS/ANAME instead,"
  echo -e "  or transfer the zone to Cloudflare DNS for automatic config."
fi

echo ""
echo -e "${BOLD}${GREEN}Done.${NC}"
echo -e "  Preview:  https://pepassure.pages.dev"
echo -e "  Target:   https://$DOMAIN  (after DNS propagates)"
echo ""
read -rp "Press Enter to close..."
