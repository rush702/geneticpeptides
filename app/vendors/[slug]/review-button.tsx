"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import ReviewModal from "@/components/ReviewModal";

export default function WriteReviewButton({
  vendorSlug,
  vendorName,
}: {
  vendorSlug: string;
  vendorName: string;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setReviewOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald/10 border border-emerald/20 text-emerald text-xs font-medium rounded-lg hover:bg-emerald/20 transition-all"
      >
        <PenLine className="w-3.5 h-3.5" />
        Write Review
      </button>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        vendorSlug={vendorSlug}
        vendorName={vendorName}
        onNeedAuth={() => setAuthOpen(true)}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={() => {
          setAuthOpen(false);
          setTimeout(() => setReviewOpen(true), 300);
        }}
      />
    </>
  );
}
