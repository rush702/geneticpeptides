#!/usr/bin/env python3
"""
PeptideVerify Daily Scraper
--------------------------
Pulls live data from vendor sites, Reddit (r/Peptides, r/nootropics),
and COA pages. Outputs scores/json that the website reads from.

Run:  python3 peptideverify_scraper.py
Schedule: cron  0 4 * * *  (4 AM daily)

Dependencies:
  pip install requests beautifulsoup4 praw
"""

import json, re, time, datetime, os, logging
from pathlib import Path

# ── Optional imports (graceful fallback) ─────────────────────────────────────
try:
    import requests
    from bs4 import BeautifulSoup
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    print("⚠  Install: pip install requests beautifulsoup4")

try:
    import praw
    HAS_PRAW = True
except ImportError:
    HAS_PRAW = False
    print("⚠  Install: pip install praw  (needed for Reddit sentiment)")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("peptideverify")

OUTPUT_FILE = Path(__file__).parent.parent / "vendor_data.json"

# ── Vendor registry ───────────────────────────────────────────────────────────
# Base data seeded from manual research (March 2026).
# Scraper enriches this with live signals daily.

VENDORS = [
    {
        "id": "ascension",
        "name": "Ascension Peptides",
        "url": "https://ascensionpeptides.com",
        "coa_url": "https://ascensionpeptides.com/lab-results",
        "region": "usa",
        "verified": True,
        "reddit_search_terms": ["ascension peptides", "ascensionpeptides"],
        "reddit_handle": "AscensionPeptides",
        # Seeded scores (overwritten if scraper finds live data)
        "seed": {"purity": 99, "reputation": 96, "service": 92, "community": 97, "pricing": 84},
        "catalog_size": "85+ peptides",
        "notable": "Consistently #1 on r/Peptides in 2026. Independent 3rd-party COAs per batch.",
        "flagship": ["BPC-157", "TB-500", "Semaglutide", "Retatrutide"],
    },
    {
        "id": "limitless",
        "name": "Limitless Life Nootropics",
        "url": "https://limitlesslifenootropics.com",
        "coa_url": "https://limitlesslifenootropics.com/pages/coas",
        "region": "usa",
        "verified": True,
        "reddit_search_terms": ["limitless life", "limitless nootropics", "limitlesslife"],
        "reddit_handle": "LimitlessLifeNootropics",
        "seed": {"purity": 97, "reputation": 94, "service": 90, "community": 96, "pricing": 88},
        "catalog_size": "34+ peptides",
        "notable": "Most detailed impurity profiles of any vendor. Top r/Peptides community pick.",
        "flagship": ["BPC-157", "Ipamorelin", "CJC-1295", "GHK-Cu"],
    },
    {
        "id": "peptide_partners",
        "name": "Peptide Partners",
        "url": "https://peptidepartners.com",
        "coa_url": "https://peptidepartners.com/lab-results",
        "region": "usa",
        "verified": True,
        "reddit_search_terms": ["peptide partners", "peptidepartners"],
        "reddit_handle": None,
        "seed": {"purity": 98, "reputation": 91, "service": 88, "community": 86, "pricing": 80},
        "catalog_size": "60+ peptides",
        "notable": "Finnrick #1 rated vendor — A-grade across BPC-157, Ipamorelin, Retatrutide, TB-500.",
        "flagship": ["BPC-157", "Ipamorelin", "Retatrutide", "TB-500"],
    },
    {
        "id": "soma",
        "name": "Soma Chems",
        "url": "https://somachems.com",
        "coa_url": "https://somachems.com/certificates-of-analysis",
        "region": "usa",
        "verified": True,
        "reddit_search_terms": ["soma chems", "somachems"],
        "reddit_handle": None,
        "seed": {"purity": 90, "reputation": 88, "service": 87, "community": 91, "pricing": 95},
        "catalog_size": "50+ peptides",
        "notable": "Budget-friendly. GMP US manufacturing. Capsule form available. Strong pricing.",
        "flagship": ["GHK-Cu", "Selank", "Epithalon", "PT-141"],
    },
    {
        "id": "core_peptides",
        "name": "Core Peptides",
        "url": "https://corepeptides.com",
        "coa_url": "https://corepeptides.com/lab-results",
        "region": "usa",
        "verified": True,
        "reddit_search_terms": ["core peptides", "corepeptides"],
        "reddit_handle": None,
        "seed": {"purity": 93, "reputation": 87, "service": 89, "community": 85, "pricing": 91},
        "catalog_size": "100+ peptides & blends",
        "notable": "Largest US catalog. Rapidly gaining trust in community. Blends available.",
        "flagship": ["BPC-157", "TB-500", "KPV", "Thymosin Alpha-1"],
    },
    {
        "id": "swiss_chems",
        "name": "Swiss Chems",
        "url": "https://swisschems.is",
        "coa_url": "https://swisschems.is/pages/lab-tests",
        "region": "eu",
        "verified": False,
        "reddit_search_terms": ["swiss chems", "swisschems"],
        "reddit_handle": None,
        "seed": {"purity": 79, "reputation": 82, "service": 77, "community": 76, "pricing": 92},
        "catalog_size": "40+ peptides",
        "notable": "EU-based. COAs available but batch-specific transparency gaps noted.",
        "flagship": ["Melanotan II", "GHRP-6", "Hexarelin", "BPC-157"],
    },
    {
        "id": "pure_rawz",
        "name": "Pure Rawz",
        "url": "https://purerawz.co",
        "coa_url": "https://purerawz.co/pages/lab-results",
        "region": "usa",
        "verified": False,
        "reddit_search_terms": ["pure rawz", "purerawz"],
        "reddit_handle": None,
        "seed": {"purity": 72, "reputation": 71, "service": 74, "community": 68, "pricing": 89},
        "catalog_size": "80+ peptides",
        "notable": "Wide catalog. COAs present but some are dated. Pricing competitive.",
        "flagship": ["MK-677", "IGF-1 LR3", "TB-500"],
    },
    {
        "id": "bpc_labs_au",
        "name": "BPC Labs Australia",
        "url": "https://bpclabs.com.au",
        "coa_url": "https://bpclabs.com.au/lab-results",
        "region": "au",
        "verified": True,
        "reddit_search_terms": ["bpc labs australia", "bpclabs"],
        "reddit_handle": None,
        "seed": {"purity": 86, "reputation": 81, "service": 84, "community": 79, "pricing": 78},
        "catalog_size": "30+ peptides",
        "notable": "Top AU vendor. Fast AU/NZ shipping. Independent 3rd-party COAs.",
        "flagship": ["BPC-157", "DSIP", "LL-37", "TB-500"],
    },
]

# ── Weights (must sum to 100) ─────────────────────────────────────────────────
WEIGHTS = {"purity": 30, "reputation": 25, "service": 20, "community": 15, "pricing": 10}


# ═════════════════════════════════════════════════════════════════════════════
#  SCORING ENGINE
# ═════════════════════════════════════════════════════════════════════════════

def compute_prs(pillars: dict) -> float:
    """Compute PeptideVerify Score (0-100) from pillar dict."""
    return round(sum(pillars[k] * WEIGHTS[k] / 100 for k in WEIGHTS), 1)


# ═════════════════════════════════════════════════════════════════════════════
#  SCRAPER MODULES
# ═════════════════════════════════════════════════════════════════════════════

def scrape_vendor_site(vendor: dict) -> dict:
    """Scrape vendor website for signals: COA links, response time, catalog size."""
    if not HAS_REQUESTS:
        return {}
    signals = {}
    try:
        t0 = time.time()
        r = requests.get(vendor["url"], timeout=10, headers={"User-Agent": "PeptideVerify-Bot/1.0"})
        signals["response_ms"] = int((time.time() - t0) * 1000)
        signals["site_up"] = r.status_code == 200
        soup = BeautifulSoup(r.text, "html.parser")

        # Count product links as rough catalog proxy
        product_links = [a for a in soup.find_all("a", href=True)
                         if any(kw in (a.get("href") or "").lower()
                                for kw in ["product", "peptide", "catalog", "shop"])]
        signals["product_link_count"] = len(product_links)

        # Check for COA keywords
        page_text = soup.get_text().lower()
        signals["has_coa_mention"] = any(kw in page_text for kw in ["certificate of analysis", "coa", "hplc", "mass spec"])
        signals["has_third_party"] = any(kw in page_text for kw in ["third party", "third-party", "independent lab", "external lab"])

    except Exception as e:
        log.warning(f"[{vendor['id']}] Site scrape failed: {e}")
    return signals


def scrape_reddit_sentiment(vendor: dict, reddit=None) -> dict:
    """Fetch recent Reddit mentions and compute simple sentiment score."""
    signals = {}
    if not HAS_PRAW or reddit is None:
        return signals

    positive_words = {"legit", "great", "quality", "recommend", "excellent", "pure", "trusted",
                      "love", "solid", "fast", "clean", "real", "good", "best", "top", "verified"}
    negative_words = {"fake", "scam", "bunk", "underdosed", "bad", "avoid", "terrible",
                      "sketchy", "wrong", "failed", "impure", "slow", "issue", "problem"}

    try:
        subreddits = ["Peptides", "nootropics", "Biohackers", "PeptidesRaw"]
        pos, neg, total = 0, 0, 0
        for term in vendor["reddit_search_terms"][:2]:  # cap to 2 terms
            for sub in subreddits[:2]:
                for post in reddit.subreddit(sub).search(term, limit=20, time_filter="year"):
                    text = (post.title + " " + post.selftext).lower()
                    words = set(re.findall(r'\b\w+\b', text))
                    pos += len(words & positive_words)
                    neg += len(words & negative_words)
                    total += 1
        if total > 0:
            raw = (pos - neg) / max(pos + neg, 1)
            signals["reddit_sentiment_raw"] = round(raw, 3)
            signals["reddit_post_count"] = total
            # Map to 0-100 score (50 = neutral)
            signals["reddit_score"] = min(100, max(0, int(50 + raw * 50)))
        log.info(f"[{vendor['id']}] Reddit: {total} posts, sentiment={signals.get('reddit_score', 'N/A')}")
    except Exception as e:
        log.warning(f"[{vendor['id']}] Reddit scrape failed: {e}")
    return signals


def score_from_signals(vendor: dict, site_signals: dict, reddit_signals: dict) -> dict:
    """Blend seed scores with live scraped signals."""
    pillars = vendor["seed"].copy()

    # Purity: has_third_party boosts, missing COA mention penalizes
    if site_signals.get("has_third_party"):
        pillars["purity"] = min(100, pillars["purity"] + 2)
    if site_signals.get("has_coa_mention") is False:
        pillars["purity"] = max(0, pillars["purity"] - 5)

    # Reputation: site down is a heavy penalty
    if site_signals.get("site_up") is False:
        pillars["reputation"] = max(0, pillars["reputation"] - 15)

    # Service: fast site response = better service proxy
    ms = site_signals.get("response_ms")
    if ms:
        if ms < 500:
            pillars["service"] = min(100, pillars["service"] + 2)
        elif ms > 3000:
            pillars["service"] = max(0, pillars["service"] - 3)

    # Community: blend Reddit sentiment
    reddit_score = reddit_signals.get("reddit_score")
    if reddit_score is not None:
        pillars["community"] = int(pillars["community"] * 0.4 + reddit_score * 0.6)

    return pillars


# ═════════════════════════════════════════════════════════════════════════════
#  MAIN PIPELINE
# ═════════════════════════════════════════════════════════════════════════════

def init_reddit() -> object:
    """Init PRAW with env vars or .env file."""
    if not HAS_PRAW:
        return None
    client_id     = os.getenv("REDDIT_CLIENT_ID", "")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET", "")
    user_agent    = os.getenv("REDDIT_USER_AGENT", "PeptideVerify:v1.0 (by /u/peptideverify_bot)")
    if not client_id or not client_secret:
        log.warning("Reddit creds not set. Skipping Reddit sentiment. "
                    "Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET env vars.")
        return None
    return praw.Reddit(client_id=client_id, client_secret=client_secret,
                       user_agent=user_agent, read_only=True)


def run():
    log.info("=== PeptideVerify Scraper Starting ===")
    reddit = init_reddit()
    results = []

    for vendor in VENDORS:
        log.info(f"Processing: {vendor['name']}")

        # Scrape
        site_sig   = scrape_vendor_site(vendor)
        reddit_sig = scrape_reddit_sentiment(vendor, reddit)

        # Score
        pillars = score_from_signals(vendor, site_sig, reddit_sig)
        prs     = compute_prs(pillars)

        results.append({
            "id":           vendor["id"],
            "name":         vendor["name"],
            "url":          vendor["url"],
            "region":       vendor["region"],
            "verified":     vendor["verified"],
            "score":        prs,
            "pillars":      pillars,
            "catalog_size": vendor["catalog_size"],
            "notable":      vendor["notable"],
            "flagship":     vendor["flagship"],
            "live_signals": {**site_sig, **reddit_sig},
            "updated_at":   datetime.datetime.utcnow().isoformat() + "Z",
        })
        time.sleep(1)  # polite crawl rate

    # Sort by PRS descending
    results.sort(key=lambda x: x["score"], reverse=True)

    # Write JSON
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump({
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "vendor_count": len(results),
            "vendors": results,
        }, f, indent=2)

    log.info(f"✅ Wrote {len(results)} vendors to {OUTPUT_FILE}")
    log.info("Top 3 PRS scores:")
    for v in results[:3]:
        log.info(f"  {v['score']:5.1f}  {v['name']}")


if __name__ == "__main__":
    run()
