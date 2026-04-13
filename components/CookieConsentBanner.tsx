"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already acknowledged cookies
    const consent = localStorage.getItem("pepassure_cookie_consent");
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("pepassure_cookie_consent", "accepted");
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pepassure_cookie_consent", "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-ink-2 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-emerald" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              Cookie Notice
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              We use essential cookies for authentication and site functionality.
              We do not use tracking cookies or sell your data. By continuing to
              use PepAssure, you agree to our{" "}
              <Link
                href="/privacy#6"
                className="text-emerald hover:text-emerald-light underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-emerald text-white text-xs font-medium rounded-lg hover:bg-emerald-light transition-colors"
              >
                Accept
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-xs text-gray-500 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-600 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
