import Link from "next/link";
import {
  TrendingUp,
  ArrowRight,
  UserPlus,
  ThumbsUp,
  Clock,
  ExternalLink,
  FlaskConical,
  Shield,
  ChevronUp,
  Globe,
} from "lucide-react";

// Seed data with real vendors from the peptide community
// These are vendors frequently discussed on r/Peptides, r/SARMs, etc.
// In production, this reads from Supabase `nominations` table
const mockNominations = [
  {
    id: "nom-1",
    nomineeName: "Tailor Made Compounding",
    nomineeWebsite: "https://tailormadehealth.com",
    nomineeSlug: "tailor-made-compounding",
    voteCount: 312,
    nominationCount: 74,
    peptidesRequested: ["Semaglutide", "Tirzepatide", "BPC-157", "NAD+"],
    status: "under_review",
    latestNomination: "1 hour ago",
  },
  {
    id: "nom-2",
    nomineeName: "Paradigm Peptides",
    nomineeWebsite: "https://paradigmpeptides.com",
    nomineeSlug: "paradigm-peptides",
    voteCount: 247,
    nominationCount: 58,
    peptidesRequested: ["BPC-157", "Semaglutide", "Tirzepatide", "CJC-1295"],
    status: "under_review",
    latestNomination: "3 hours ago",
  },
  {
    id: "nom-3",
    nomineeName: "Amino Asylum",
    nomineeWebsite: "https://aminoasylum.com",
    nomineeSlug: "amino-asylum",
    voteCount: 198,
    nominationCount: 45,
    peptidesRequested: ["TB-500", "BPC-157", "Ipamorelin", "MK-677"],
    status: "queued_for_testing",
    latestNomination: "5 hours ago",
  },
  {
    id: "nom-4",
    nomineeName: "Empower Pharmacy",
    nomineeWebsite: "https://empowerpharmacy.com",
    nomineeSlug: "empower-pharmacy",
    voteCount: 176,
    nominationCount: 41,
    peptidesRequested: ["Semaglutide", "Tirzepatide", "PT-141", "NAD+"],
    status: "queued_for_testing",
    latestNomination: "8 hours ago",
  },
  {
    id: "nom-5",
    nomineeName: "Peptide Sciences",
    nomineeWebsite: "https://peptidesciences.com",
    nomineeSlug: "peptide-sciences",
    voteCount: 156,
    nominationCount: 37,
    peptidesRequested: ["BPC-157", "CJC-1295", "GHK-Cu", "Epithalon"],
    status: "pending",
    latestNomination: "1 day ago",
  },
  {
    id: "nom-6",
    nomineeName: "Swiss Chems",
    nomineeWebsite: "https://swisschems.is",
    nomineeSlug: "swiss-chems",
    voteCount: 143,
    nominationCount: 33,
    peptidesRequested: ["Semaglutide", "Tirzepatide", "Selank", "Retatrutide"],
    status: "pending",
    latestNomination: "1 day ago",
  },
  {
    id: "nom-7",
    nomineeName: "Limitless Life Nootropics",
    nomineeWebsite: "https://limitlesslifenootropics.com",
    nomineeSlug: "limitless-life-nootropics",
    voteCount: 128,
    nominationCount: 29,
    peptidesRequested: ["Selank", "Semax", "NAD+", "Epithalon", "Dihexa"],
    status: "pending",
    latestNomination: "2 days ago",
  },
  {
    id: "nom-8",
    nomineeName: "Genetic Peptides USA",
    nomineeWebsite: "https://geneticpeptidesusa.com",
    nomineeSlug: "genetic-peptides-usa",
    voteCount: 112,
    nominationCount: 24,
    peptidesRequested: ["BPC-157", "TB-500", "Semaglutide"],
    status: "queued_for_testing",
    latestNomination: "2 days ago",
  },
  {
    id: "nom-9",
    nomineeName: "PureRawz",
    nomineeWebsite: "https://purerawz.co",
    nomineeSlug: "purerawz",
    voteCount: 104,
    nominationCount: 22,
    peptidesRequested: ["BPC-157", "Ipamorelin", "CJC-1295", "AOD-9604"],
    status: "pending",
    latestNomination: "3 days ago",
  },
  {
    id: "nom-10",
    nomineeName: "Trident Peptides",
    nomineeWebsite: "https://tridentpeptides.com",
    nomineeSlug: "trident-peptides",
    voteCount: 97,
    nominationCount: 20,
    peptidesRequested: ["Tirzepatide", "Retatrutide", "AOD-9604", "MOTS-c"],
    status: "pending",
    latestNomination: "3 days ago",
  },
  {
    id: "nom-11",
    nomineeName: "Hallandale Pharmacy",
    nomineeWebsite: "https://hallandalepharmacy.com",
    nomineeSlug: "hallandale-pharmacy",
    voteCount: 89,
    nominationCount: 18,
    peptidesRequested: ["Semaglutide", "Tirzepatide", "BPC-157"],
    status: "pending",
    latestNomination: "4 days ago",
  },
  {
    id: "nom-12",
    nomineeName: "Chemyo",
    nomineeWebsite: "https://chemyo.com",
    nomineeSlug: "chemyo",
    voteCount: 82,
    nominationCount: 16,
    peptidesRequested: ["BPC-157", "TB-500", "GHK-Cu"],
    status: "pending",
    latestNomination: "5 days ago",
  },
  {
    id: "nom-13",
    nomineeName: "Direct Peptides",
    nomineeWebsite: "https://directpeptides.com",
    nomineeSlug: "direct-peptides",
    voteCount: 74,
    nominationCount: 14,
    peptidesRequested: ["KPV", "LL-37", "Thymosin Alpha-1"],
    status: "pending",
    latestNomination: "5 days ago",
  },
  {
    id: "nom-14",
    nomineeName: "Xpeptides",
    nomineeWebsite: "https://xpeptides.com",
    nomineeSlug: "xpeptides",
    voteCount: 67,
    nominationCount: 12,
    peptidesRequested: ["BPC-157", "Semaglutide", "PT-141"],
    status: "pending",
    latestNomination: "1 week ago",
  },
  {
    id: "nom-15",
    nomineeName: "Peptide Pros",
    nomineeWebsite: "https://peptidepros.net",
    nomineeSlug: "peptide-pros",
    voteCount: 58,
    nominationCount: 10,
    peptidesRequested: ["Tirzepatide", "Retatrutide", "CJC-1295"],
    status: "pending",
    latestNomination: "1 week ago",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  under_review: { label: "Under Review", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  queued_for_testing: { label: "Queued for Testing", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  verified: { label: "Verified", color: "bg-emerald/10 text-emerald border-emerald/20" },
};

export default function MostWantedPage() {
  const totalVotes = mockNominations.reduce((sum, n) => sum + n.voteCount, 0);

  return (
    <div className="min-h-screen molecular-bg pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">Community Driven</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Most <span className="text-gradient">Wanted</span> Vendors
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            The community decides which vendors get verified next. Nominate vendors
            you use and upvote the ones you want to see tested.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>
              <strong className="text-white">{mockNominations.length}</strong> vendors nominated
            </span>
            <span>&middot;</span>
            <span>
              <strong className="text-white">{totalVotes.toLocaleString()}</strong> total votes
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* CTA */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-display font-bold text-white">Leaderboard</h2>
          <Link
            href="/nominate"
            className="btn-glow flex items-center gap-2 px-5 py-2.5 bg-emerald text-white font-medium rounded-lg hover:bg-emerald-light"
          >
            <UserPlus className="w-4 h-4" />
            Nominate a Vendor
          </Link>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {mockNominations.map((nom, i) => {
            const status = statusConfig[nom.status] || statusConfig.pending;
            return (
              <div
                key={nom.id}
                className="card-glow group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-ink-2 border border-white/5 rounded-xl"
              >
                {/* Rank */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                    i === 0
                      ? "bg-yellow-500/20 text-yellow-400"
                      : i === 1
                      ? "bg-gray-400/20 text-gray-300"
                      : i === 2
                      ? "bg-amber-700/20 text-amber-500"
                      : "bg-ink-3 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-white group-hover:text-emerald transition-colors">
                      {nom.nomineeName}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {nom.nomineeWebsite && (
                      <a
                        href={nom.nomineeWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-emerald transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        {nom.nomineeWebsite.replace(/https?:\/\//, "").replace(/\/$/, "")}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {nom.latestNomination}
                    </span>
                  </div>
                  {/* Peptide pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {nom.peptidesRequested.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] px-2 py-0.5 bg-ink-3 text-gray-400 rounded-full"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vote column */}
                <div className="flex sm:flex-col items-center gap-2 sm:gap-1 flex-shrink-0">
                  <button className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald hover:bg-emerald/20 transition-all">
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-bold text-white">{nom.voteCount}</span>
                  <span className="text-[10px] text-gray-600">votes</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Don&apos;t see the vendor you&apos;re looking for?
          </p>
          <Link
            href="/nominate"
            className="btn-glow inline-flex items-center gap-2 px-8 py-4 bg-emerald text-white font-semibold text-lg rounded-xl hover:bg-emerald-light"
          >
            <UserPlus className="w-5 h-5" />
            Nominate a Vendor
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

