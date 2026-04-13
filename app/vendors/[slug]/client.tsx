"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Share2, Check, Building2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import ClaimModal from "@/components/ClaimModal";
import { createClient } from "@/lib/supabase/client";

export default function VendorDetailClient({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} on PepAssure`,
          url,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleClaimClick = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAuthOpen(true);
    } else {
      setClaimOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClaimClick}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald/10 border border-emerald/20 text-emerald font-medium rounded-lg hover:bg-emerald/20 transition-all"
      >
        <Building2 className="w-4 h-4" />
        Claim This Listing
      </button>
      <button
        onClick={() => setSaved(!saved)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
          saved
            ? "bg-emerald/10 border border-emerald/20 text-emerald"
            : "bg-ink-2 border border-white/10 text-gray-300 hover:border-white/20"
        }`}
      >
        {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        {saved ? "Saved" : "Save"}
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2.5 bg-ink-2 border border-white/10 text-gray-300 rounded-lg font-medium hover:border-white/20 transition-all"
      >
        {shared ? <Check className="w-4 h-4 text-emerald" /> : <Share2 className="w-4 h-4" />}
        {shared ? "Copied" : "Share"}
      </button>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={() => {
          setAuthOpen(false);
          setTimeout(() => setClaimOpen(true), 300);
        }}
      />
      <ClaimModal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        prefillVendorName={name}
        prefillWebsite=""
      />
    </>
  );
}
