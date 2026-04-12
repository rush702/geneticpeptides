/**
 * Sentiment analysis engine for Reddit mentions.
 * Uses a word-list classifier (fast, no API dependency).
 * Upgrade path: swap in OpenAI or HuggingFace for NLP in Phase 2.
 */

// Positive signal words in peptide vendor context
const POSITIVE_WORDS = new Set([
  "legit", "legitimate", "reliable", "trusted", "trustworthy", "recommend",
  "recommended", "great", "excellent", "amazing", "perfect", "quality",
  "pure", "consistent", "fast", "quick", "responsive", "professional",
  "verified", "authentic", "good", "best", "solid", "decent", "happy",
  "satisfied", "impressed", "repeat", "reorder", "love", "accurate",
  "transparent", "honest", "clean", "potent", "effective", "works",
  "arrived", "delivered", "discrete", "discreet", "fresh", "sterile",
  "hplc", "tested", "third-party", "third party", "coa", "certificate",
  "batch", "refund", "replaced", "helpful", "support", "answered",
]);

// Negative signal words
const NEGATIVE_WORDS = new Set([
  "scam", "scammed", "fake", "counterfeit", "bunk", "garbage", "trash",
  "underdosed", "contaminated", "impure", "dirty", "sketchy", "shady",
  "avoid", "warning", "ripped", "rip-off", "ripoff", "fraud", "stolen",
  "seized", "customs", "never arrived", "lost", "missing", "wrong",
  "mislabeled", "expired", "degraded", "cloudy", "particles", "pain",
  "infection", "abscess", "reaction", "allergic", "sick", "hospital",
  "lawsuit", "fda", "warning letter", "shutdown", "closed", "gone",
  "disappeared", "ghosted", "no response", "ignored", "refused",
  "overpriced", "expensive", "slow", "delayed", "weeks", "months",
  "terrible", "awful", "worst", "horrible", "disappointed", "regret",
  "complaint", "chargeback", "dispute", "paypal", "refund denied",
]);

// Topic extraction patterns
const TOPIC_PATTERNS: { pattern: RegExp; topic: string }[] = [
  { pattern: /ship(ping|ped|s)?|deliver(y|ed)?|arriv(e|ed)/i, topic: "shipping" },
  { pattern: /pur(ity|e)|hplc|mass spec|chromatogram/i, topic: "purity" },
  { pattern: /coa|certificate|test(ing|ed)?|lab/i, topic: "testing" },
  { pattern: /price|cost|cheap|expensive|afford|deal/i, topic: "pricing" },
  { pattern: /support|service|respond|email|contact|help/i, topic: "customer_service" },
  { pattern: /packag(e|ing)|discrete|discreet|box|vial/i, topic: "packaging" },
  { pattern: /refund|return|replace|exchange|money back/i, topic: "refunds" },
  { pattern: /scam|fake|fraud|legit|trust|avoid|warning/i, topic: "trust" },
  { pattern: /dose|dosage|potent|effective|works|results/i, topic: "efficacy" },
  { pattern: /sterile|sterility|filter|bacteria|endotoxin/i, topic: "sterility" },
];

// Shill detection signals
const SHILL_SIGNALS = {
  accountAgeDays: 30,     // accounts < 30 days old
  minKarma: 50,           // accounts with < 50 karma
  onlyPositive: true,     // account only posts positive about one vendor
};

export interface SentimentResult {
  sentiment: "positive" | "neutral" | "negative";
  score: number;        // -1.0 to 1.0
  topics: string[];
  isShill: boolean;
  positiveCount: number;
  negativeCount: number;
}

export function analyzeSentiment(
  text: string,
  authorKarma?: number,
  authorAgeDays?: number
): SentimentResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;

  // Count positive and negative signal words
  for (const word of words) {
    const cleaned = word.replace(/[^a-z-]/g, "");
    if (POSITIVE_WORDS.has(cleaned)) positiveCount++;
    if (NEGATIVE_WORDS.has(cleaned)) negativeCount++;
  }

  // Also check multi-word phrases
  Array.from(POSITIVE_WORDS).forEach((phrase) => {
    if (phrase.includes(" ") && lower.includes(phrase)) positiveCount++;
  });
  Array.from(NEGATIVE_WORDS).forEach((phrase) => {
    if (phrase.includes(" ") && lower.includes(phrase)) negativeCount++;
  });

  // Compute raw score (-1 to 1)
  const total = positiveCount + negativeCount;
  let score = 0;
  if (total > 0) {
    score = (positiveCount - negativeCount) / total;
  }

  // Classify sentiment
  let sentiment: "positive" | "neutral" | "negative";
  if (score > 0.15) sentiment = "positive";
  else if (score < -0.15) sentiment = "negative";
  else sentiment = "neutral";

  // Extract topics
  const topics: string[] = [];
  for (const { pattern, topic } of TOPIC_PATTERNS) {
    if (pattern.test(text)) {
      topics.push(topic);
    }
  }

  // Shill detection
  const isShill =
    sentiment === "positive" &&
    ((authorAgeDays !== undefined && authorAgeDays < SHILL_SIGNALS.accountAgeDays) ||
      (authorKarma !== undefined && authorKarma < SHILL_SIGNALS.minKarma));

  return {
    sentiment,
    score,
    topics,
    isShill,
    positiveCount,
    negativeCount,
  };
}

/**
 * Compute aggregate sentiment for a vendor from multiple mentions.
 */
export function aggregateSentiment(
  mentions: { sentiment: string; score: number; isShill: boolean; upvotes: number }[]
): {
  overall: "positive" | "neutral" | "negative";
  score: number;
  positivePercent: number;
  totalMentions: number;
  shillCount: number;
} {
  // Filter out shills
  const genuine = mentions.filter((m) => !m.isShill);

  if (genuine.length === 0) {
    return {
      overall: "neutral",
      score: 0,
      positivePercent: 0,
      totalMentions: mentions.length,
      shillCount: mentions.length - genuine.length,
    };
  }

  // Weight by upvotes (more upvoted = more credible)
  let weightedSum = 0;
  let totalWeight = 0;
  let positiveCount = 0;

  for (const m of genuine) {
    const weight = Math.max(1, m.upvotes);
    weightedSum += m.score * weight;
    totalWeight += weight;
    if (m.sentiment === "positive") positiveCount++;
  }

  const avgScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const positivePercent = Math.round((positiveCount / genuine.length) * 100);

  let overall: "positive" | "neutral" | "negative";
  if (avgScore > 0.15) overall = "positive";
  else if (avgScore < -0.15) overall = "negative";
  else overall = "neutral";

  return {
    overall,
    score: Math.round(avgScore * 100) / 100,
    positivePercent,
    totalMentions: mentions.length,
    shillCount: mentions.length - genuine.length,
  };
}
