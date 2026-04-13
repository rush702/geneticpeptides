#!/usr/bin/env python3
"""
inject_vendor_data.py
─────────────────────
Reads vendor_data.json (output of peptideverify_scraper.py) and injects
the fresh vendor array into peptideverify_website.html, replacing the
static const VENDORS = [...] block.

Run after scraper:
  python3 inject_vendor_data.py
"""

import json, re, sys
from pathlib import Path

BASE       = Path(__file__).parent.parent
JSON_FILE  = BASE / "vendor_data.json"
HTML_FILE  = BASE / "peptideverify_website.html"
DEPLOY_FILE = BASE / "deploy" / "index.html"

# ── Pillar label map ──────────────────────────────────────────────────────────
PILLAR_META = [
    ("purity",     "Purity",   "c-teal"),
    ("reputation", "Repute",   "c-blue"),
    ("service",    "Service",  "c-green"),
    ("community",  "Reddit",   "c-gold"),
    ("pricing",    "Price",    "c-purple"),
]

def score_class(s):
    if s >= 85: return "sc-hi"
    if s >= 70: return "sc-md"
    return "sc-lo"

def trend_info(v, prev_scores: dict):
    """Return (trend_str, trend_class) comparing current score to previous run."""
    vid   = v["id"]
    curr  = v["score"]
    prev  = prev_scores.get(vid)
    if prev is None:
        return "→", "trend-fl"
    delta = round(curr - prev, 1)
    if delta > 0.3:
        return f"+{delta}", "trend-up"
    if delta < -0.3:
        return f"{delta}", "trend-dn"
    return "→", "trend-fl"

def finnrick_url(v):
    slug = v.get("live_signals", {}).get("finnrick_url") or \
           (f"https://www.finnrick.com/vendors/{v.get('finnrick_slug','')}" if v.get("finnrick_grade","N/A") != "N/A" else None)
    # Prefer stored URL if present in vendor dict
    return v.get("finnrick_url") or slug

def js_str(s):
    """Escape a string for JS single-quote context."""
    if s is None:
        return "null"
    return '"' + str(s).replace("\\","\\\\").replace('"','\\"').replace("&","&amp;") + '"'

def build_vendors_js(vendors, prev_scores):
    lines = ["const VENDORS = ["]
    for v in vendors:
        vid     = v["id"]
        score   = v["score"]
        sc      = score_class(score)
        trend, tclass = trend_info(v, prev_scores)
        pillars = v.get("pillars", {})
        fin_grade = v.get("finnrick_grade", "N/A")
        fin_url   = finnrick_url(v)
        fin_tests = v.get("finnrick_tests", 0)
        flagship  = v.get("flagship", [])
        shutdown  = v.get("shutdown", False)

        pillar_js = ", ".join(
            '{' + f'l:{js_str(lbl)},v:{pillars.get(key,0)},c:{js_str(css)}' + '}'
            for key, lbl, css in PILLAR_META
        )

        lines.append(
            f'  {{id:{js_str(vid)},name:{js_str(v["name"])},url:{js_str(v["url"])},'
            f'region:{js_str(v.get("region","usa"))},verified:{"true" if v.get("verified") else "false"},'
            f'shutdown:{"true" if shutdown else "false"},'
            f'score:{score},scoreClass:{js_str(sc)},trend:{js_str(trend)},trendClass:{js_str(tclass)},'
            f'finnrick_grade:{js_str(fin_grade)},'
            f'finnrick_url:{"null" if fin_url is None else js_str(fin_url)},'
            f'finnrick_tests:{fin_tests},'
            f'pillars:[{pillar_js}],'
            f'peptides:[{", ".join(js_str(p) for p in flagship[:4])}],'
            f'notable:{js_str(v.get("notable",""))},'
            f'}},'
        )
    lines.append("];")
    return "\n".join(lines)

def load_prev_scores(html_path: Path) -> dict:
    """Extract current scores from HTML for trend calculation."""
    scores = {}
    if not html_path.exists():
        return scores
    text = html_path.read_text()
    for m in re.finditer(r'id:"([^"]+)"[^}]*?score:([\d.]+)', text):
        scores[m.group(1)] = float(m.group(2))
    return scores

def inject(html_path: Path, new_block: str):
    text = html_path.read_text()
    # Replace everything between VENDOR_DATA_START markers, or replace const VENDORS = [...];
    start_marker = "const VENDORS = ["
    end_marker   = "];"

    start_idx = text.find(start_marker)
    if start_idx == -1:
        print(f"  ❌ Could not find '{start_marker}' in {html_path.name}")
        return False

    # Find the matching closing ]; (look for ]; that ends the VENDORS array)
    # We need to count brackets to find the real end
    bracket_depth = 0
    end_idx = start_idx
    for i, ch in enumerate(text[start_idx:], start=start_idx):
        if ch == "[":
            bracket_depth += 1
        elif ch == "]":
            bracket_depth -= 1
            if bracket_depth == 0:
                # Check if followed by ;
                rest = text[i:i+2].strip()
                end_idx = i + 2  # include ];
                break

    old_block = text[start_idx:end_idx]
    new_text  = text[:start_idx] + new_block + text[end_idx:]
    html_path.write_text(new_text)
    print(f"  ✅ Injected {new_block.count(chr(10))} lines into {html_path.name}")
    return True


def run():
    print("═══════════════════════════════════════════")
    print("  💉 Injecting vendor_data.json → HTML")
    print("═══════════════════════════════════════════")

    if not JSON_FILE.exists():
        print(f"❌ {JSON_FILE} not found. Run the scraper first.")
        sys.exit(1)

    data    = json.loads(JSON_FILE.read_text())
    vendors = data.get("vendors", [])
    print(f"  📦 {len(vendors)} vendors loaded from {JSON_FILE.name}")
    print(f"  🕒 Generated: {data.get('generated_at','unknown')}")

    # Load previous scores for trend arrows
    prev_scores = load_prev_scores(HTML_FILE)

    # Build the new JS block
    new_block = build_vendors_js(vendors, prev_scores)

    # Inject into source HTML
    ok1 = inject(HTML_FILE, new_block)

    # Also update deploy/index.html
    ok2 = inject(DEPLOY_FILE, new_block)

    if ok1 or ok2:
        print("")
        print("  Top 3 vendors after injection:")
        for v in vendors[:3]:
            print(f"    {v['score']:5.1f}  {v['name']}  (Finnrick: {v.get('finnrick_grade','N/A')})")
        print("")
        print("  ✅ Done. Run 🚀 Deploy NOW.command to push live.")
    else:
        sys.exit(1)

if __name__ == "__main__":
    run()
