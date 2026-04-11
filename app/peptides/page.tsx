"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FlaskConical,
  Search,
  Heart,
  Zap,
  Brain,
  Sparkles,
  Shield,
  Activity,
  ArrowRight,
  Pill,
} from "lucide-react";
import { peptides, getVendorsForPeptide } from "@/lib/peptides";

const categoryIcons = {
  Healing: Heart,
  "GLP-1": Activity,
  "Growth Hormone": Zap,
  Nootropic: Brain,
  Longevity: Sparkles,
  Immune: Shield,
  Melanocortin: Pill,
};

const categoryColors = {
  Healing: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "GLP-1": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Growth Hormone": "bg-emerald/10 text-emerald border-emerald/20",
  Nootropic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Longevity: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Immune: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Melanocortin: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

const categories = ["All", "Healing", "GLP-1", "Growth Hormone", "Nootropic", "Longevity", "Immune", "Melanocortin"];

export default function PeptidesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    let list = [...peptides];
    if (category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.synonyms.some((s) => s.toLowerCase().includes(q)) ||
          p.researchAreas.some((r) => r.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, category]);

  return (
    <div className="min-h-screen molecular-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-6">
            <FlaskConical className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">Peptide Library</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Browse <span className="text-gradient">Research Peptides</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Find which verified vendors sell a specific peptide, ranked by PVS quality score.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search peptides, research areas, or synonyms..."
                className="w-full pl-12 pr-4 py-4 bg-ink-2 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 transition-all text-base"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8 justify-center">
          {categories.map((cat) => {
            const Icon = cat !== "All" ? categoryIcons[cat as keyof typeof categoryIcons] : FlaskConical;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-emerald/20 text-emerald border border-emerald/30"
                    : "bg-ink-2 text-gray-500 border border-white/5 hover:border-white/10 hover:text-gray-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat}
              </button>
            );
          })}
        </div>

        {/* Peptide grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FlaskConical className="w-10 h-10 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No peptides found.</p>
            <button
              onClick={() => { setQuery(""); setCategory("All"); }}
              className="mt-4 text-sm text-emerald hover:text-emerald-light transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, i) => {
              const vendorCount = getVendorsForPeptide(p.name).length;
              const Icon = categoryIcons[p.category];
              return (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/peptides/${p.slug}`}
                    className="card-glow group block p-6 bg-ink-2 border border-white/5 rounded-xl h-full"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${categoryColors[p.category]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-gray-500">
                        {vendorCount} {vendorCount === 1 ? "vendor" : "vendors"}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald transition-colors">
                      {p.name}
                    </h3>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border ${categoryColors[p.category]} mb-3`}>
                      {p.category}
                    </span>
                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-4">
                      {p.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.researchAreas.slice(0, 3).map((area) => (
                        <span
                          key={area}
                          className="text-[10px] px-2 py-0.5 bg-ink-3 text-gray-400 rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-xs text-gray-600">{p.molecularWeight}</span>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-emerald group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="mt-8 text-center text-sm text-gray-600">
            Showing {filtered.length} of {peptides.length} peptides
          </p>
        )}
      </div>
    </div>
  );
}
