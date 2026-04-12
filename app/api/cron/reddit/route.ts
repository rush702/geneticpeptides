import { NextResponse, type NextRequest } from "next/server";
import { scrapeRedditMentions } from "@/lib/scrapers/reddit";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s timeout for scraping

/**
 * Reddit scraper cron endpoint.
 * Runs every 6 hours via Vercel Cron.
 * Protected by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    console.log("[cron/reddit] Starting Reddit scrape...");
    const result = await scrapeRedditMentions();

    let inserted = 0;
    let skipped = 0;

    if (supabase && result.mentions.length > 0) {
      for (const mention of result.mentions) {
        const { error } = await supabase.from("reddit_mentions").upsert(
          {
            vendor_slug: mention.vendorSlug,
            subreddit: mention.post.subreddit,
            post_id: mention.post.id,
            post_title: mention.post.title,
            post_body: mention.post.selftext?.substring(0, 2000), // truncate
            author: mention.post.author,
            upvotes: mention.post.score,
            comment_count: mention.post.num_comments,
            sentiment: mention.sentiment.sentiment,
            sentiment_score: mention.sentiment.score,
            topics: mention.sentiment.topics,
            is_shill: mention.sentiment.isShill,
            permalink: mention.post.permalink,
            posted_at: new Date(mention.post.created_utc * 1000).toISOString(),
          },
          { onConflict: "post_id" }
        );

        if (error) {
          console.warn(`[cron/reddit] Upsert error for ${mention.post.id}:`, error.message);
          skipped++;
        } else {
          inserted++;
        }
      }
    } else if (!supabase) {
      console.warn("[cron/reddit] Supabase not configured — results not persisted");
    }

    const summary = {
      success: true,
      subredditsScraped: result.subredditsScraped,
      postsScanned: result.postsScanned,
      mentionsFound: result.mentions.length,
      inserted,
      skipped,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    };

    console.log("[cron/reddit] Complete:", JSON.stringify(summary));
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[cron/reddit] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
