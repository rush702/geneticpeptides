#!/usr/bin/env python3
"""
PeptideVerify Daily Scraper
--------------------------
Pulls live data from:
  • Vendor websites  (COA signals, site health, catalog size)
  • Finnrick Analytics (finnrick.com) — independent lab test grades A-E
  • Reddit (r/Peptides, r/nootropics, r/Biohackers) — community sentiment

Outputs vendor_data.json that the PeptideVerify website reads from.

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
        # Seeded scores (enriched daily by live scrapers)
        "seed": {"purity": 99, "reputation": 96, "service": 92, "community": 97, "pricing": 84},
        "catalog_size": "85+ peptides",
        "notable": "#1 on r/Peptides 2026. Finnrick A-grade. Batch-specific 3rd-party COAs. 85+ compounds.",
        "flagship": ["BPC-157", "TB-500", "Semaglutide", "Retatrutide"],
        # Finnrick Analytics integration
        "finnrick_slug": "ascension-peptides",
        "finnrick_grade_seed": "A",   # seed from manual research — overwritten by live scrape
        "finnrick_tests_seed": 23,
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
        "notable": "Most detailed impurity profiles. Finnrick B-grade (22 tests). Top community pick.",
        "flagship": ["BPC-157", "Ipamorelin", "CJC-1295", "GHK-Cu"],
        "finnrick_slug": "limitless-life-nootropics",
        "finnrick_grade_seed": "B",
        "finnrick_tests_seed": 22,
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
        "notable": "Finnrick A-grade across all 64 tested compounds. BPC-157 & Retatrutide top-rated.",
        "flagship": ["BPC-157", "Ipamorelin", "Retatrutide", "TB-500"],
        "finnrick_slug": "peptide-partners",
        "finnrick_grade_seed": "A",
        "finnrick_tests_seed": 64,
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
        "notable": "Best pricing in market. GMP US manufacturing. Capsule form available.",
        "flagship": ["GHK-Cu", "Selank", "Epithalon", "PT-141"],
        "finnrick_slug": "soma-chems",   # attempt scrape; may not exist
        "finnrick_grade_seed": "N/A",
        "finnrick_tests_seed": 0,
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
        "notable": "Largest US catalog (100+ compounds & blends). Rapidly rising in community trust.",
        "flagship": ["BPC-157", "TB-500", "KPV", "Thymosin Alpha-1"],
        "finnrick_slug": "core-peptides",
        "finnrick_grade_seed": "N/A",
        "finnrick_tests_seed": 0,
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
        "notable": "EU-based. Finnrick C-grade (9 tests). COA transparency gaps flagged by community.",
        "flagship": ["Melanotan II", "GHRP-6", "Hexarelin", "BPC-157"],
        "finnrick_slug": "swiss-chems",
        "finnrick_grade_seed": "C",
        "finnrick_tests_seed": 9,
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
        "notable": "Wide catalog, competitive pricing. Finnrick C-grade. Some COAs are dated.",
        "flagship": ["MK-677", "IGF-1 LR3", "TB-500"],
        "finnrick_slug": "pure-rawz",
        "finnrick_grade_seed": "C",
        "finnrick_tests_seed": 8,
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
        "finnrick_slug": "bpc-labs-australia",
        "finnrick_grade_seed": "N/A",
        "finnrick_tests_seed": 0,
    },
]

# ── Finnrick grade → numeric score (0-100) ───────────────────────────────────
FINNRICK_GRADE_SCORE = {"A": 93, "B": 78, "C": 62, "D": 45, "E": 25, "N/A": None}
FINNRICK_BASE_URL = "https://www.finnrick.com/vendors/"

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

def scrape_finnrick(vendor: dict) -> dict:
    """
    Scrape finnrick.com/vendors/{slug} for:
      - Overall letter grade (A–E)
      - Number of lab tests conducted
      - Average numeric score (0–10)
      - Most recent test date
      - List of products tested

    Falls back to seeded values if the page is unavailable.
    """
    if not HAS_REQUESTS:
        return {}

    slug = vendor.get("finnrick_slug", "")
    if not slug:
        return {"finnrick_grade": "N/A", "finnrick_tests": 0, "finnrick_score": None}

    url = FINNRICK_BASE_URL + slug
    signals = {
        "finnrick_url": url,
        "finnrick_grade": vendor.get("finnrick_grade_seed", "N/A"),
        "finnrick_tests": vendor.get("finnrick_tests_seed", 0),
        "finnrick_score": None,
        "finnrick_last_test": None,
        "finnrick_products": [],
    }

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; PeptideVerify-Bot/1.0; +https://peptideverify.com)",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
        }
        r = requests.get(url, timeout=12, headers=headers)
        if r.status_code == 404:
            log.info(f"[{vendor['id']}] Finnrick: vendor page not found (404) — using seed grade")
            signals["finnrick_grade"] = "N/A"
            signals["finnrick_tests"] = 0
            return signals
        if r.status_code != 200:
            log.warning(f"[{vendor['id']}] Finnrick: HTTP {r.status_code}")
            return signals

        soup = BeautifulSoup(r.text, "html.parser")
        text = soup.get_text(" ", strip=True)

        # ── Grade: look for single letter A-E in prominent headings ──────────
        grade_match = re.search(r'\bRating\s*:?\s*([A-E])\b', text, re.IGNORECASE)
        if not grade_match:
            # fallback: look for "Rating A" or "grade A" patterns
            grade_match = re.search(r'\b(?:grade|rated|rating)\s+([A-E])\b', text, re.IGNORECASE)
        if grade_match:
            signals["finnrick_grade"] = grade_match.group(1).upper()

        # ── Test count ────────────────────────────────────────────────────────
        tests_match = re.search(r'(\d[\d,]*)\s+(?:independent\s+)?(?:lab\s+)?(?:tests?|samples?)', text, re.IGNORECASE)
        if tests_match:
            signals["finnrick_tests"] = int(tests_match.group(1).replace(",", ""))

        # ── Numeric score (0-10 scale) ────────────────────────────────────────
        score_match = re.search(r'(?:average\s+)?score\s*:?\s*(\d+\.\d+)\s*(?:/\s*10)?', text, re.IGNORECASE)
        if score_match:
            raw = float(score_match.group(1))
            signals["finnrick_score"] = round(raw * 10, 1)  # convert 0-10 → 0-100

        # ── Most recent test date ─────────────────────────────────────────────
        date_match = re.search(r'(?:latest|last|most recent)\s+test[^:]*:?\s*(\d{1,2}\s+\w{3,9}\s+\d{4}|\w{3,9}\s+\d{4}|\d{4}-\d{2}-\d{2})', text, re.IGNORECASE)
        if date_match:
            signals["finnrick_last_test"] = date_match.group(1)

        # ── Products tested ───────────────────────────────────────────────────
        # Look for known peptide names in the page
        known_peptides = ["BPC-157", "TB-500", "Retatrutide", "Semaglutide", "Tirzepatide",
                          "Ipamorelin", "CJC-1295", "GHK-Cu", "Selank", "PT-141", "Melanotan",
                          "GHRP-6", "IGF-1", "Hexarelin", "Thymosin", "Epithalon", "DSIP", "LL-37"]
        found = [p for p in known_peptides if p.lower() in text.lower()]
        if found:
            signals["finnrick_products"] = found[:8]  # cap at 8

        log.info(f"[{vendor['id']}] Finnrick: grade={signals['finnrick_grade']}, "
                 f"tests={signals['finnrick_tests']}, score={signals['finnrick_score']}")

    except Exception as e:
        log.warning(f"[{vendor['id']}] Finnrick scrape failed: {e} — using seed values")

    return signals


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


def finnrick_grade_to_score(grade: str) -> int | None:
    """Convert Finnrick letter grade to a 0-100 influence score."""
    return FINNRICK_GRADE_SCORE.get(grade.upper() if grade else "N/A")


def score_from_signals(vendor: dict, site_signals: dict, reddit_signals: dict,
                       finnrick_signals: dict) -> dict:
    """Blend seed scores with live scraped signals from vendor site, Reddit, and Finnrick."""
    pillars = vendor["seed"].copy()

    # ── Vendor site signals ───────────────────────────────────────────────────
    # Purity: third-party COA mention is a positive signal
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

    # ── Reddit sentiment ──────────────────────────────────────────────────────
    reddit_score = reddit_signals.get("reddit_score")
    if reddit_score is not None:
        pillars["community"] = int(pillars["community"] * 0.4 + reddit_score * 0.6)

    # ── Finnrick lab data (strongest signal — independent lab tests) ───────────
    # Finnrick score is blended into purity (60% weight) and reputation (40% weight)
    # when the vendor has been tested. N/A vendors are unchanged.
    finnrick_grade = finnrick_signals.get("finnrick_grade", "N/A")
    finnrick_numeric = finnrick_grade_to_score(finnrick_grade)
    finnrick_numeric_page = finnrick_signals.get("finnrick_score")  # parsed from page (0-100)

    # If the page had a parsed numeric score, prefer that over letter-grade lookup
    best_finnrick = finnrick_numeric_page if finnrick_numeric_page else finnrick_numeric

    if best_finnrick is not None:
        # Purity pillar: 60% seed + 40% Finnrick (scaled to vendor's range)
        pillars["purity"] = min(100, int(pillars["purity"] * 0.60 + best_finnrick * 0.40))
        # Reputation pillar: slight nudge based on Finnrick (authoritative external source)
        pillars["reputation"] = min(100, int(pillars["reputation"] * 0.75 + best_finnrick * 0.25))

    # Finnrick grade downgrades for poor performers (D or E)
    if finnrick_grade in ("D", "E"):
        pillars["purity"]     = max(0, pillars["purity"] - 10)
        pillars["reputation"] = max(0, pillars["reputation"] - 8)

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
    log.info("Data sources: Vendor sites · Finnrick Analytics · Reddit sentiment")
    reddit = init_reddit()
    results = []

    for vendor in VENDORS:
        log.info(f"─── Processing: {vendor['name']} ───")

        # 1. Vendor website signals
        site_sig     = scrape_vendor_site(vendor)

        # 2. Finnrick Analytics — independent lab test grades
        finnrick_sig = scrape_finnrick(vendor)
        time.sleep(1.5)  # polite rate between Finnrick requests

        # 3. Reddit community sentiment
        reddit_sig   = scrape_reddit_sentiment(vendor, reddit)

        # 4. Score blending (all three sources)
        pillars = score_from_signals(vendor, site_sig, reddit_sig, finnrick_sig)
        prs     = compute_prs(pillars)

        results.append({
            "id":              vendor["id"],
            "name":            vendor["name"],
            "url":             vendor["url"],
            "region":          vendor["region"],
            "verified":        vendor["verified"],
            "score":           prs,
            "pillars":         pillars,
            "catalog_size":    vendor["catalog_size"],
            "notable":         vendor["notable"],
            "flagship":        vendor["flagship"],
            # Finnrick-specific fields (shown on website cards)
            "finnrick_grade":    finnrick_sig.get("finnrick_grade", "N/A"),
            "finnrick_tests":    finnrick_sig.get("finnrick_tests", 0),
            "finnrick_url":      finnrick_sig.get("finnrick_url"),
            "finnrick_products": finnrick_sig.get("finnrick_products", []),
            "finnrick_last_test":finnrick_sig.get("finnrick_last_test"),
            # Raw signals for audit
            "live_signals":    {**site_sig, **reddit_sig, **{
                k: v for k, v in finnrick_sig.items()
                if k not in ("finnrick_grade", "finnrick_tests", "finnrick_url",
                             "finnrick_products", "finnrick_last_test")
            }},
            "updated_at":      datetime.datetime.utcnow().isoformat() + "Z",
        })
        time.sleep(1)  # polite crawl rate between vendors

    # Sort by PRS descending
    results.sort(key=lambda x: x["score"], reverse=True)

    # Write JSON
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump({
            "generated_at":   datetime.datetime.utcnow().isoformat() + "Z",
            "vendor_count":   len(results),
            "data_sources":   ["vendor_sites", "finnrick_analytics", "reddit_sentiment"],
            "finnrick_base":  FINNRICK_BASE_URL,
            "vendors":        results,
        }, f, indent=2)

    log.info(f"✅ Wrote {len(results)} vendors → {OUTPUT_FILE}")
    log.info("Top 3 PVS scores:")
    for v in results[:3]:
        fi = v.get("finnrick_grade","N/A")
        log.info(f"  {v['score']:5.1f}  {v['name']}  (Finnrick: {fi})")


if __name__ == "__main__":
    run()
