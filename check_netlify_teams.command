#!/bin/bash
TOKEN="nfp_CeCPZhrVWqbWRzeAhpmAkoMgcmg7HB4443f5"
cd "$(dirname "$0")"

echo "Checking Netlify teams + per-site accounts..."
echo ""
echo "=== TEAMS ==="
curl -s -H "Authorization: Bearer $TOKEN" "https://api.netlify.com/api/v1/accounts" | python3 -c "
import json, sys
try:
    accts = json.load(sys.stdin)
except Exception as e:
    print('Error:', e); sys.exit(1)
for a in accts:
    print(f\"  slug={a.get('slug','?'):<25} name={a.get('name','?'):<25} type={a.get('type_name','?')}  capabilities_sites={a.get('capabilities',{}).get('sites',{}).get('included')}\")
"

echo ""
echo "=== SITES (with account slug) ==="
curl -s -H "Authorization: Bearer $TOKEN" "https://api.netlify.com/api/v1/sites?per_page=100" | python3 -c "
import json, sys
sites = json.load(sys.stdin)
for s in sites:
    print(f\"  name={s.get('name','?'):<35} account_slug={s.get('account_slug','?'):<20} url={s.get('ssl_url','-')}\")
"
echo ""
read -rp "Press Enter to close..."
