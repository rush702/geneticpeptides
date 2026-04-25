"use client";

import Link from "next/link";
import {
  Home,
  FlaskConical,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Search,
  Shield,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen molecular-bg flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl mx-auto text-center relative">
        {/* Gradient orb */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[400px] bg-emerald/5 rounded-full blur-[100px]" />
        </div>

        {/* Shield with glitch effect */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald/10 border border-emerald/20 mb-8 animate-pulse-glow">
          <Shield className="w-10 h-10 text-emerald" />
        </div>

        {/* 404 display */}
        <h1 className="font-display text-8xl md:text-9xl font-bold mb-4">
          <span className="text-gradient">404</span>
        </h1>

        <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
          Peptide Not Found
        </h2>

        <p className="text-gray-400 leading-relaxed mb-10 max-w-md mx-auto">
          Looks like this page has vanished from our database. It might have been moved, deleted, or you&apos;re on an old link. Let&apos;s get you back on track.
        </p>

        {/* Primary actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link
            href="/"
            className="btn-glow flex items-center gap-2 px-6 py-3 bg-emerald text-ink font-semibold rounded-xl hover:bg-emerald-light"
          >
            <Home className="w-4 h-4" />
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => typeof window !== "undefined" && window.history.back()}
            className="flex items-center gap-2 px-6 py-3 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Suggested links */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Popular destinations
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link
              href="/#vendors"
              className="card-glow group flex items-center gap-3 p-4 bg-ink-2 border border-white/5 rounded-xl text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center flex-shrink-0">
                <Search className="w-4 h-4 text-emerald" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-emerald transition-colors">
                  Vendor Rankings
                </p>
                <p className="text-xs text-gray-500">Browse all vendors</p>
              </div>
            </Link>
            <Link
              href="/peptides"
              className="card-glow group flex items-center gap-3 p-4 bg-ink-2 border border-white/5 rounded-xl text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-4 h-4 text-emerald" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-emerald transition-colors">
                  Peptide Library
                </p>
                <p className="text-xs text-gray-500">12 research peptides</p>
              </div>
            </Link>
            <Link
              href="/blog"
              className="card-glow group flex items-center gap-3 p-4 bg-ink-2 border border-white/5 rounded-xl text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-emerald" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-emerald transition-colors">
                  Blog
                </p>
                <p className="text-xs text-gray-500">Guides & research</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
