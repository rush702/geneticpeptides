"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  FlaskConical,
  Building2,
  Megaphone,
  Tag,
} from "lucide-react";
import { posts, categories, type BlogPost } from "@/lib/blog";

const categoryIcons = {
  guides: BookOpen,
  research: FlaskConical,
  industry: Building2,
  updates: Megaphone,
};

const categoryColors = {
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

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = [...posts];
    if (activeCategory !== "all") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const featuredPosts = posts.filter((p) => p.featured);

  return (
    <div className="min-h-screen molecular-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-6">
            <BookOpen className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">Blog & Resources</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Peptide Knowledge <span className="text-gradient">Base</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Guides, research insights, and industry analysis from the PepAssure team.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        {/* Featured posts */}
        {activeCategory === "all" && !searchQuery && featuredPosts.length > 0 && (
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-6">
              Featured
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map((post, i) => {
                const CatIcon = categoryIcons[post.category];
                return (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="card-glow group block p-8 bg-ink-2 border border-white/5 rounded-2xl h-full"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${categoryColors[post.category]}`}>
                          <CatIcon className="w-3 h-3" />
                          {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" /> {post.readTime}
                        </span>
                      </div>
                      <h2 className="text-xl font-display font-bold text-white mb-3 group-hover:text-emerald transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-400 leading-relaxed mb-6">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <span className="text-gray-400">{post.author.name}</span>
                          {" · "}
                          {formatDate(post.date)}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-emerald group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeCategory === cat.key
                    ? "bg-emerald/20 text-emerald border border-emerald/30"
                    : "bg-ink-2 text-gray-500 border border-white/5 hover:border-white/10 hover:text-gray-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2.5 bg-ink-2 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30"
            />
          </div>
        </div>

        {/* Posts list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No articles found</p>
            <p className="text-gray-600 text-sm">Try a different category or search term.</p>
            <button
              onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
              className="mt-4 text-emerald text-sm hover:text-emerald-light transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post, i) => {
              const CatIcon = categoryIcons[post.category];
              return (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="card-glow group flex flex-col md:flex-row items-start gap-4 p-6 bg-ink-2 border border-white/5 rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${categoryColors[post.category]}`}>
                          <CatIcon className="w-3 h-3" />
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-600">{formatDate(post.date)}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-emerald transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2 flex-shrink-0">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                      <span className="text-xs text-gray-600">{post.author.name}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
