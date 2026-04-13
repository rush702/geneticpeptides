#!/usr/bin/env python3
"""
apply_reddit_sentiment.py
─────────────────────────
Reads scraper/reddit_sentiment.json and patches the 'community' pillar
in vendor_data.json with curated Reddit sentiment scores.

Run after the main scraper, before inject_vendor_data.py:
  python3 apply_reddit_sentiment.py

This allows Reddit sentiment to be managed via a simple JSON file
without needing live Reddit API credentials (PRAW).
"""

import json, sys
from pathlib import Path
from datetime import datetime, timezone

BASE           = Path(__file__).parent.parent
SENTIMENT_FILE = Path(__file__).parent / "reddit_sentiment.json"
VENDOR_JSON    = BASE / "vendor_data.json"


def run():
    print("═══════════════════════════════════════════")
    print("  📊 Applying Reddit Sentiment from JSON")
    print("═══════════════════════════════════════════")

    if not SENTIMENT_FILE.exists():
        print(f"  ⚠️  {SENTIMENT_FILE.name} not found — skipping Reddit sentiment patch.")
        return 0

    if not VENDOR_JSON.exists():
        print(f"  ❌ {VENDOR_JSON.name} not found. Run scraper first.")
        return 1

    sentiment = json.loads(SENTIMENT_FILE.read_text())
    sent_vendors = sentiment.get("vendors", {})
    meta = sentiment.get("_meta", {})

    data = json.loads(VENDOR_JSON.read_text())
    vendors = data.get("vendors", [])

    updated = 0
    skipped = 0
    for v in vendors:
        vid = v["id"]
        if vid in sent_vendors:
            s = sent_vendors[vid]
            new_score = s.get("score")
            if new_score is not None:
                old_score = v.get("pillars", {}).get("community", "N/A")
                v.setdefault("pillars", {})["community"] = new_score

                # Also store full sentiment metadata on the vendor
                v["reddit_sentiment"] = {
                    "score":        new_score,
                    "mention_count": s.get("mention_count", 0),
                    "positive_pct":  s.get("positive_pct", 0),
                    "negative_pct":  s.get("negative_pct", 0),
                    "neutral_pct":   s.get("neutral_pct", 0),
                    "common_positives": s.get("common_positives", []),
                    "common_negatives": s.get("common_negatives", []),
                    "notes":         s.get("notes", ""),
                    "last_reviewed": meta.get("last_reviewed", ""),
                }

                print(f"  ✅ {v['name']}: community {old_score} → {new_score}  "
                      f"(+{s.get('positive_pct',0)}% / -{s.get('negative_pct',0)}%  "
                      f"{s.get('mention_count',0)} mentions)")
                updated += 1
        else:
            print(f"  ⚠️  {v['name']} ({vid}) not in reddit_sentiment.json — keeping existing score.")
            skipped += 1

    # Recalculate overall vendor score as weighted average of pillars
    WEIGHTS = {
        "purity":     0.30,
        "reputation": 0.25,
        "service":    0.20,
        "community":  0.15,
        "pricing":    0.10,
    }
    recalculated = 0
    for v in vendors:
        pillars = v.get("pillars", {})
        if all(k in pillars for k in WEIGHTS):
            new_total = sum(pillars[k] * w for k, w in WEIGHTS.items())
            new_total = round(new_total, 1)
            old_total = v.get("score", 0)
            if abs(new_total - old_total) > 0.05:
                v["score"] = new_total
                recalculated += 1

    # Sort vendors by score descending
    vendors.sort(key=lambda v: v.get("score", 0), reverse=True)

    # Stamp the JSON
    data["vendors"] = vendors
    data["reddit_sentiment_applied"] = datetime.now(timezone.utc).isoformat()
    data["reddit_sentiment_source"] = str(SENTIMENT_FILE.name)

    VENDOR_JSON.write_text(json.dumps(data, indent=2, ensure_ascii=False))

    print("")
    print(f"  ✅ Patched {updated} vendors, skipped {skipped}, recalculated {recalculated} scores.")
    print(f"  📋 Last reviewed: {meta.get('last_reviewed', 'unknown')}")
    print(f"  💾 Saved → {VENDOR_JSON.name}")
    return 0


if __name__ == "__main__":
    sys.exit(run())
