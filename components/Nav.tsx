"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Shield, LogOut, LayoutDashboard, User as UserIcon, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      const u = res.data?.user ?? null;
      setUser(u);
      if (u) {
        supabase
          .from("profiles")
          .select("is_admin")
          .eq("user_id", u.id)
          .single()
          .then((r: any) => setIsAdmin(r.data?.is_admin ?? false));
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/peptides", label: "Peptides" },
    { href: "/for-vendors", label: "For Vendors" },
    { href: "/blog", label: "Blog" },
    ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "h-16 bg-ink/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
          : "h-20 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center group-hover:bg-emerald/20 transition-colors">
            <Shield className="w-5 h-5 text-emerald" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            PepAssure
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-emerald transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-lg text-emerald text-sm hover:bg-emerald/20 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/account"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <UserIcon className="w-4 h-4" />
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/for-vendors"
              className="btn-glow px-5 py-2.5 bg-emerald text-white text-sm font-medium rounded-lg hover:bg-emerald-light"
            >
              Claim Listing
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-ink-2/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 space-y-3 animate-slide-up">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-gray-300 hover:text-emerald py-2 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleSignOut}
              className="block text-gray-400 hover:text-white py-2"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/for-vendors"
              onClick={() => setMobileOpen(false)}
              className="block bg-emerald text-white text-center py-3 rounded-lg font-medium"
            >
              Claim Listing
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
