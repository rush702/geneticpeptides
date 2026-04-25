"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Globe,
  Mail,
  Save,
  Loader2,
  CheckCircle2,
  Key,
  Bell,
  Shield,
} from "lucide-react";

interface SettingsPanelProps {
  profile: {
    vendor_name: string;
    website: string;
    contact_email?: string;
    tier: string;
  };
  userEmail: string;
}

export default function SettingsPanel({ profile, userEmail }: SettingsPanelProps) {
  const [vendorName, setVendorName] = useState(profile.vendor_name);
  const [website, setWebsite] = useState(profile.website);
  const [contactEmail, setContactEmail] = useState(profile.contact_email || userEmail);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Notification prefs
  const [emailScoreChanges, setEmailScoreChanges] = useState(true);
  const [emailCOAUpdates, setEmailCOAUpdates] = useState(true);
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(false);
  const [emailMentions, setEmailMentions] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save — replace with real Supabase update
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Profile section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-ink-2 border border-white/5 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald" />
          Vendor Profile
        </h3>

        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Vendor Name
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-4 py-3 bg-ink border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Contact Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-glow flex items-center gap-2 px-5 py-2.5 bg-emerald text-ink font-medium rounded-lg hover:bg-emerald-light disabled:opacity-50 transition-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved" : saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>

      {/* Notification preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-ink-2 border border-white/5 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald" />
          Notifications
        </h3>

        <div className="space-y-4 max-w-lg">
          {[
            { label: "Score changes", desc: "Get notified when your PVS score changes", value: emailScoreChanges, set: setEmailScoreChanges },
            { label: "COA verification updates", desc: "Status changes on uploaded COAs", value: emailCOAUpdates, set: setEmailCOAUpdates },
            { label: "Weekly analytics report", desc: "Summary of your dashboard metrics every Monday", value: emailWeeklyReport, set: setEmailWeeklyReport },
            { label: "Community mentions", desc: "When your vendor is mentioned on Reddit or forums", value: emailMentions, set: setEmailMentions },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between p-3 bg-ink rounded-lg">
              <div>
                <p className="text-sm text-white">{pref.label}</p>
                <p className="text-xs text-gray-500">{pref.desc}</p>
              </div>
              <button
                onClick={() => pref.set(!pref.value)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  pref.value ? "bg-emerald" : "bg-ink-3 border border-white/10"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    pref.value ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* API key (Enterprise only) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-ink-2 border border-white/5 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-emerald" />
          API Access
          {profile.tier !== "enterprise" && (
            <span className="ml-2 text-xs bg-emerald/10 text-emerald px-2 py-0.5 rounded-full">
              Enterprise
            </span>
          )}
        </h3>

        {profile.tier === "enterprise" ? (
          <div className="max-w-lg">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value="pvs_live_sk_1234567890abcdef"
                readOnly
                className="flex-1 px-4 py-3 bg-ink border border-white/10 rounded-lg text-white font-mono text-sm"
              />
              <button className="px-4 py-3 bg-emerald/10 border border-emerald/20 text-emerald rounded-lg hover:bg-emerald/20 transition-all text-sm">
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use this key to authenticate API requests. Keep it secret.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-ink rounded-lg">
            <Shield className="w-5 h-5 text-gray-500" />
            <p className="text-sm text-gray-500">
              API access is available on the Enterprise plan.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
