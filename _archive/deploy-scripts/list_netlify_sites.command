#!/bin/bash
TOKEN="nfp_CeCPZhrVWqbWRzeAhpmAkoMgcmg7HB4443f5"
echo "Fetching Netlify sites..."
curl -s -H "Authorization: Bearer $TOKEN" "https://api.netlify.com/api/v1/sites?per_page=100" | python3 -c "
import json, sys
try:
    sites = json.load(sys.stdin)
except Exception as e:
    print('Parse error:', e); sys.exit(1)
if isinstance(sites, dict):
    print('Response:', json.dumps(sites, indent=2)); sys.exit(0)
print(f'Total sites: {len(sites)}')
for s in sites:
    print(f\"  id={s.get('site_id','?')[:16]}  name={s.get('name','?'):<35}  ssl={s.get('ssl_url','-')}  custom={s.get('custom_domain','-')}\")
"
echo ""
read -rp "Press Enter to close..."
