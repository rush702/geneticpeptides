import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  FlaskConical,
  Building2,
  Megaphone,
  Share2,
  ChevronRight,
} from "lucide-react";
import { posts } from "@/lib/blog";

const categoryIcons: Record<string, typeof BookOpen> = {
  guides: BookOpen,
  research: FlaskConical,
  industry: Building2,
  updates: Megaphone,
};

const categoryColors: Record<string, string> = {
  guides: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  research: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  industry: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  updates: "bg-emerald/10 text-emerald border-emerald/20",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* Simple Markdown-ish renderer for the blog content */
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-2 my-4 pl-1">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-gray-300 text-[15px] leading-relaxed">
              <span className="text-emerald mt-1.5 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const inlineFormat = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-ink-3 text-emerald rounded text-sm font-mono">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${elements.length}`} className="my-4 p-4 bg-ink rounded-xl border border-white/5 overflow-x-auto">
            <code className="text-sm text-gray-300 font-mono">{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-2xl font-display font-bold text-white mt-10 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-lg font-semibold text-white mt-8 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("✅ ") || trimmed.startsWith("❌ ")) {
      const bullet = trimmed.startsWith("- ") ? trimmed.slice(2) : trimmed;
      listItems.push(bullet);
    } else {
      flushList();
      elements.push(
        <p
          key={`p-${elements.length}`}
          className="text-gray-300 text-[15px] leading-relaxed my-3"
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
        />
      );
    }
  }

  flushList();
  return elements;
}

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) return notFound();

  const CatIcon = categoryIcons[post.category] || BookOpen;

  // Related posts (same category, excluding current)
  const related = posts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  return (
    <div className="min-h-screen molecular-bg">
      <article className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All articles
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${categoryColors[post.category]}`}>
              <CatIcon className="w-3 h-3" />
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" /> {post.readTime} read
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed mb-6">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between border-t border-b border-white/5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                <span className="text-sm font-bold text-emerald">
                  {post.author.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{post.author.name}</p>
                <p className="text-xs text-gray-500">{post.author.role}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{formatDate(post.date)}</span>
          </div>
        </header>

        {/* Content */}
        <div className="prose-dark">{renderContent(post.content)}</div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-16 pt-8 border-t border-white/5">
            <h3 className="text-lg font-semibold text-white mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {related.map((r) => {
                const RCatIcon = categoryIcons[r.category] || BookOpen;
                return (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="card-glow group p-5 bg-ink-2 border border-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${categoryColors[r.category]}`}>
                        <RCatIcon className="w-3 h-3" />
                        {r.category}
                      </span>
                      <span className="text-xs text-gray-400">{r.readTime}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-emerald transition-colors mb-1">
                      {r.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{r.excerpt}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
