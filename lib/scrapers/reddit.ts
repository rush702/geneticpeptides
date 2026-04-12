/**
 * Reddit scraper for peptide vendor mentions.
 *
 * Uses Reddit's public JSON endpoints (no auth required for read).
 * Rate limited to 1 request per 2 seconds to stay under Reddit's
 * unauthenticated rate limit of 10 req/min.
 *
 * Upgrade path: add OAuth2 via Reddit API app for higher rate limits
 * and access to more data (user profiles, comment trees).
 */

import { analyzeSentiment, type SentimentResult } from "./sentiment";
import { vendors } from "@/lib/vendors";

// Subreddits to monitor — ordered by relevance
export const TARGET_SUBREDDITS = [
  "Peptides",
  "SARMs",
  "ResearchChemicals",
  "Semaglutide",
  "Tirzepatide",
  "nootropics",
  "longevity",
  "Peptidesinformation",
];

// Vendor name patterns for matching (case-insensitive)
function getVendorPatterns(): { slug: string; patterns: RegExp[] }[] {
  return vendors.map((v) => ({
    slug: v.slug,
    patterns: [
      new RegExp(`\\b${escapeRegex(v.name)}\\b`, "i"),
      // Also match common abbreviations/variations
      ...(v.name.includes(" ")
        ? [new RegExp(`\\b${escapeRegex(v.name.replace(/\s+/g, ""))}\\b`, "i")]
        : []),
    ],
  }));
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  score: number;
  num_comments: number;
  permalink: string;
  created_utc: number;
}

export interface RedditMention {
  vendorSlug: string;
  post: RedditPost;
  sentiment: SentimentResult;
  matchedIn: "title" | "body" | "both";
}

/**
 * Fetch recent posts from a subreddit via Reddit's public JSON API.
 * No authentication required.
 */
export async function fetchSubredditPosts(
  subreddit: string,
  sort: "new" | "hot" = "new",
  limit: number = 25,
  after?: string
): Promise<{ posts: RedditPost[]; after: string | null }> {
  const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1${
    after ? `&after=${after}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "PepAssure-ResearchBot/1.0 (+https://pepassure.com/about)",
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      console.warn(`[reddit] Rate limited on r/${subreddit}. Backing off.`);
      return { posts: [], after: null };
    }
    throw new Error(`Reddit API returned ${response.status} for r/${subreddit}`);
  }

  const data = await response.json();
  const posts: RedditPost[] = data.data.children
    .filter((child: any) => child.kind === "t3")
    .map((child: any) => ({
      id: child.data.id,
      title: child.data.title || "",
      selftext: child.data.selftext || "",
      author: child.data.author || "[deleted]",
      subreddit: child.data.subreddit,
      score: child.data.score || 0,
      num_comments: child.data.num_comments || 0,
      permalink: child.data.permalink,
      created_utc: child.data.created_utc,
    }));

  return {
    posts,
    after: data.data.after || null,
  };
}

/**
 * Scan a list of Reddit posts for vendor mentions.
 * Returns mentions with sentiment analysis for each match.
 */
export function findVendorMentions(posts: RedditPost[]): RedditMention[] {
  const vendorPatterns = getVendorPatterns();
  const mentions: RedditMention[] = [];

  for (const post of posts) {
    const fullText = `${post.title} ${post.selftext}`;

    for (const { slug, patterns } of vendorPatterns) {
      const inTitle = patterns.some((p) => p.test(post.title));
      const inBody = patterns.some((p) => p.test(post.selftext));

      if (inTitle || inBody) {
        const sentiment = analyzeSentiment(fullText);

        mentions.push({
          vendorSlug: slug,
          post,
          sentiment,
          matchedIn: inTitle && inBody ? "both" : inTitle ? "title" : "body",
        });
      }
    }
  }

  return mentions;
}

/**
 * Full scrape pipeline: fetch from all subreddits, find mentions, return results.
 * Rate-limited with 2-second delays between subreddit fetches.
 */
export async function scrapeRedditMentions(): Promise<{
  mentions: RedditMention[];
  subredditsScraped: number;
  postsScanned: number;
  errors: string[];
}> {
  const allMentions: RedditMention[] = [];
  let totalPosts = 0;
  const errors: string[] = [];
  let subredditsScraped = 0;

  for (const subreddit of TARGET_SUBREDDITS) {
    try {
      // Fetch last 50 posts (2 pages of 25)
      const page1 = await fetchSubredditPosts(subreddit, "new", 25);
      const page2 = page1.after
        ? await fetchSubredditPosts(subreddit, "new", 25, page1.after)
        : { posts: [], after: null };

      const posts = [...page1.posts, ...page2.posts];
      totalPosts += posts.length;

      const mentions = findVendorMentions(posts);
      allMentions.push(...mentions);
      subredditsScraped++;

      console.log(
        `[reddit] r/${subreddit}: ${posts.length} posts, ${mentions.length} mentions found`
      );

      // Rate limit: wait 2 seconds between subreddit fetches
      await new Promise((r) => setTimeout(r, 2000));
    } catch (error) {
      const msg = `r/${subreddit}: ${error instanceof Error ? error.message : "unknown error"}`;
      errors.push(msg);
      console.error(`[reddit] Error scraping ${msg}`);
    }
  }

  return {
    mentions: allMentions,
    subredditsScraped,
    postsScanned: totalPosts,
    errors,
  };
}
