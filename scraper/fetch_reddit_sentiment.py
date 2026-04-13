#!/usr/bin/env python3
"""
fetch_reddit_sentiment.py
─────────────────────────
Automatically fetches Reddit mention data for each vendor and updates
reddit_sentiment.json with fresh sentiment scores.

Uses Reddit's public JSON API — no API credentials required.
Run before apply_reddit_sentiment.py in the daily pipeline.

Subreddits searched: r/Peptides, r/PeptidesSource, r/SARMs,
                     r/researchchemicals, r/nootropics
"""

import json, time, re, math
from pathlib import Path
from datetime import datetime, timezone, timedelta

try:
    import requests
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "--quiet"])
    import requests

# ── Config ────────────────────────────────────────────────────────────────────
BASE           = Path(__file__).parent.parent
SENTIMENT_FILE = Path(__file__).parent / "reddit_sentiment.json"

SUBREDDITS = [
    "Peptides",
    "PeptidesSource",
    "SARMs",
    "researchchemicals",
    "nootropics",
]

# How far back to look for posts (days)
LOOKBACK_DAYS = 90

# Reddit JSON API — no credentials needed, just a descriptive User-Agent
HEADERS = {
    "User-Agent": "PepAssure/1.0 (peptide vendor ranking site; contact pepassure.com)"
}

# Positive / negative sentiment keywords (case-insensitive)
POSITIVE_KW = [
    "legit", "recommend", "great", "excellent", "amazing", "fast", "love",
    "perfect", "happy", "satisfied", "quality", "trusted", "reliable",
    "good", "best", "solid", "real", "verified", "clean", "pure",
    "responsive", "helpful", "quick", "smooth", "top", "safe", "consistent",
]
NEGATIVE_KW = [
    "scam", "fake", "avoid", "bad", "slow", "terrible", "horrible", "awful",
    "underdosed", "mislabeled", "bunk", "beware", "fraud", "rip", "ripped",
    "worst", "garbage", "sketchy", "suspicious", "problem", "issue", "fail",
    "refuse", "refund", "complaint", "lost", "never", "disappointed",
]

RATE_LIMIT_DELAY = 2.5   # seconds between Reddit API calls


def reddit_search(query: str, subreddit: str = None, limit: int = 100) -> list[dict]:
    """Search Reddit for posts matching query, optionally restricted to one subreddit."""
    if subreddit:
        url = f"https://www.reddit.com/r/{subreddit}/search.json"
    else:
        url = "https://www.reddit.com/search.json"

    params = {
        "q":          query,
        "sort":       "relevance",
        "t":          "all",
        "limit":      limit,
        "restrict_sr": "true" if subreddit else "false",
        "type":       "link",
    }

    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        if resp.status_code == 429:
            print(f"    ⏳ Rate limited — waiting 30s…")
            time.sleep(30)
            resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        posts = data.get("data", {}).get("children", [])
        return [p["data"] for p in posts if p.get("kind") == "t3"]
    except Exception as e:
        print(f"    ⚠️  Reddit search failed ({query!r}): {e}")
        return []


def score_text(text: str) -> tuple[int, int]:
    """Count positive and negative keyword hits in a block of text."""
    text = text.lower()
    pos = sum(1 for kw in POSITIVE_KW if re.search(rf'\b{re.escape(kw)}\b', text))
    neg = sum(1 for kw in NEGATIVE_KW if re.search(rf'\b{re.escape(kw)}\b', text))
    return pos, neg


def calc_community_score(pos_total: int, neg_total: int, mention_count: int) -> int:
    """
    Convert raw keyword counts + mention volume into a 0–100 community score.
    Uses a Wilson-score-inspired formula that rewards high mention counts.
    """
    if mention_count == 0:
        return 50  # neutral default when no data

    total_signals = pos_total + neg_total
    if total_signals == 0:
        # Mentions exist but no strong sentiment words — neutral
        base = 65
    else:
        pos_ratio = pos_total / total_signals
        # Wilson lower-bound confidence (z=1.645 for 90% CI)
        z = 1.645
        n = total_signals
        wilson = (pos_ratio + z*z/(2*n) - z * math.sqrt((pos_ratio*(1-pos_ratio) + z*z/(4*n))/n)) / (1 + z*z/n)
        base = round(wilson * 100)

    # Volume boost: more mentions = more confidence, small bonus
    vol_bonus = min(5, round(math.log10(mention_count + 1) * 2))
    score = min(100, max(0, base + vol_bonus))
    return score


def fetch_vendor_sentiment(vendor_id: str, vendor_name: str, search_aliases: list[str]) -> dict:
    """Fetch Reddit data for a vendor and return a sentiment result dict."""
    print(f"  🔍 {vendor_name}…")

    cutoff_ts = (datetime.now(timezone.utc) - timedelta(days=LOOKBACK_DAYS)).timestamp()

    all_posts = []
    seen_ids  = set()

    # Search across target subreddits using name + aliases
    search_terms = [vendor_name] + search_aliases
    for sub in SUBREDDITS:
        for term in search_terms[:2]:  # top 2 search terms per sub
            posts = reddit_search(term, subreddit=sub, limit=50)
            for p in posts:
                if p.get("id") not in seen_ids and p.get("created_utc", 0) >= cutoff_ts:
                    seen_ids.add(p["id"])
                    all_posts.append(p)
            time.sleep(RATE_LIMIT_DELAY)

    # Also do a cross-reddit search for the vendor name
    posts = reddit_search(f"{vendor_name} peptide", limit=100)
    for p in posts:
        if p.get("id") not in seen_ids and p.get("created_utc", 0) >= cutoff_ts:
            seen_ids.add(p["id"])
            all_posts.append(p)
    time.sleep(RATE_LIMIT_DELAY)

    mention_count = len(all_posts)

    # Score each post
    pos_total = neg_total = 0
    top_threads = []
    for p in sorted(all_posts, key=lambda x: x.get("score", 0), reverse=True):
        text = f"{p.get('title','')} {p.get('selftext','')}"
        pos, neg = score_text(text)
        pos_total += pos
        neg_total += neg

        if len(top_threads) < 3 and p.get("title"):
            top_threads.append(p["title"][:120])

    total_signals = pos_total + neg_total
    if total_signals > 0:
        positive_pct = round(pos_total / total_signals * 100)
        negative_pct = round(neg_total / total_signals * 100)
    else:
        positive_pct = 0
        negative_pct = 0
    neutral_pct = 100 - positive_pct - negative_pct

    community_score = calc_community_score(pos_total, neg_total, mention_count)

    return {
        "score":          community_score,
        "mention_count":  mention_count,
        "positive_pct":   positive_pct,
        "negative_pct":   negative_pct,
        "neutral_pct":    neutral_pct,
        "top_threads":    top_threads,
        "last_reviewed":  datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "_pos_hits":      pos_total,
        "_neg_hits":      neg_total,
    }


# ── Vendor search config ──────────────────────────────────────────────────────
# For each vendor ID: (display name, [search aliases])
VENDOR_SEARCH_CONFIG = {
    "ascension":      ("Ascension Peptides",          ["ascension peptides", "ascensionpeptides"]),
    "limitless":      ("Limitless Life Nootropics",   ["limitless life", "LLN", "limitlesslife"]),
    "peptide_partners": ("Peptide Partners",          ["peptide partners", "peptidepartners"]),
    "soma":           ("Soma Chems",                  ["soma chems", "somachems"]),
    "core_peptides":  ("Core Peptides",               ["core peptides", "corepeptides"]),
    "bpc_labs_au":    ("BPC Labs Australia",          ["BPC labs", "bpclabs"]),
    "swiss_chems":    ("Swiss Chems",                 ["swiss chems", "swisschems"]),
    "pure_rawz":      ("Pure Rawz",                   ["pure rawz", "purerawz"]),
}


def run():
    print("═══════════════════════════════════════════")
    print("  🤖 Fetching Reddit Sentiment (auto)")
    print(f"  📅 Lookback: {LOOKBACK_DAYS} days")
    print(f"  📡 Subreddits: {', '.join('r/'+s for s in SUBREDDITS)}")
    print("═══════════════════════════════════════════")
    print()

    # Load existing sentiment file to preserve curated fields
    if SENTIMENT_FILE.exists():
        existing = json.loads(SENTIMENT_FILE.read_text())
    else:
        existing = {"_meta": {}, "vendors": {}}

    existing_vendors = existing.get("vendors", {})
    updated_vendors  = {}
    results = []

    for vid, (name, aliases) in VENDOR_SEARCH_CONFIG.items():
        try:
            result = fetch_vendor_sentiment(vid, name, aliases)
            score  = result["score"]
            old_score = existing_vendors.get(vid, {}).get("score", "N/A")

            print(f"    Score: {score}  (was {old_score}) | "
                  f"{result['mention_count']} mentions | "
                  f"+{result['positive_pct']}% / -{result['negative_pct']}%")
            print()

            # Merge: keep curated prose fields from existing, overwrite metrics
            merged = dict(existing_vendors.get(vid, {}))
            merged.update({
                "name":          name,
                "score":         score,
                "mention_count": result["mention_count"],
                "positive_pct":  result["positive_pct"],
                "negative_pct":  result["negative_pct"],
                "neutral_pct":   result["neutral_pct"],
                "last_reviewed": result["last_reviewed"],
            })
            # Update top_threads only if we found real ones
            if result["top_threads"]:
                merged["top_threads"] = result["top_threads"]

            updated_vendors[vid] = merged
            results.append((name, score, old_score))

        except Exception as e:
            print(f"    ❌ Error fetching {name}: {e}")
            # Keep existing data on error
            if vid in existing_vendors:
                updated_vendors[vid] = existing_vendors[vid]

    # Write updated sentiment file
    output = {
        "_meta": {
            "description": "Auto-fetched Reddit sentiment scores. Updated daily by fetch_reddit_sentiment.py.",
            "score_range":  "0–100 (higher = more positive community sentiment)",
            "lookback_days": LOOKBACK_DAYS,
            "primary_subreddits": SUBREDDITS,
            "last_fetched":  datetime.now(timezone.utc).isoformat(),
        },
        "vendors": updated_vendors,
    }

    SENTIMENT_FILE.write_text(json.dumps(output, indent=2, ensure_ascii=False))

    print("═══════════════════════════════════════════")
    print("  ✅ Reddit sentiment updated!")
    print()
    for name, new_score, old_score in results:
        arrow = "↑" if isinstance(old_score, (int,float)) and new_score > old_score else \
                "↓" if isinstance(old_score, (int,float)) and new_score < old_score else "→"
        print(f"    {arrow}  {name}: {old_score} → {new_score}")
    print(f"\n  💾 Saved → {SENTIMENT_FILE.name}")
    print("═══════════════════════════════════════════")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(run())
