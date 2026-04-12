import Link from "next/link";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  FlaskConical,
  ExternalLink,
  ArrowLeft,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

// Mock batch verification data — in production reads from batch_archive + finnrick_results
function getBatchData(batchId: string) {
  // Simulated batch lookup
  const batches: Record<string, any> = {
    "BPC-2026-0398": {
      batchId: "BPC-2026-0398",
      peptideName: "BPC-157",
      vendorSlug: "novapeptides",
      vendorName: "NovaPeptides",
      vendorScore: 96,
      vendorVerified: true,
      purity: "99.4%",
      method: "HPLC + MS",
      grade: "A",
      gradeLabel: "GREAT",
      finnrickUrl: "https://finnrick.com/products/bpc-157",
      testedDate: "March 28, 2026",
      lastVerified: "2 days ago",
      status: "verified",
    },
    "SEM-2026-0412": {
      batchId: "SEM-2026-0412",
      peptideName: "Semaglutide",
      vendorSlug: "novapeptides",
      vendorName: "NovaPeptides",
      vendorScore: 96,
      vendorVerified: true,
      purity: "99.1%",
      method: "HPLC + MS",
      grade: "A",
      gradeLabel: "GREAT",
      finnrickUrl: "https://finnrick.com/products/semaglutide",
      testedDate: "April 2, 2026",
      lastVerified: "5 days ago",
      status: "verified",
    },
    "TB5-2026-0421": {
      batchId: "TB5-2026-0421",
      peptideName: "TB-500",
      vendorSlug: "novapeptides",
      vendorName: "NovaPeptides",
      vendorScore: 96,
      vendorVerified: true,
      purity: null,
      method: null,
      grade: null,
      gradeLabel: null,
      finnrickUrl: null,
      testedDate: "April 8, 2026",
      lastVerified: null,
      status: "pending",
    },
  };

  return batches[batchId] || null;
}

const gradeColors: Record<string, string> = {
  A: "bg-emerald/20 text-emerald border-emerald/30",
  B: "bg-green-500/20 text-green-400 border-green-500/30",
  C: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  D: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  E: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default async function VerifyBatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const batch = getBatchData(batchId);

  return (
    <div className="min-h-screen molecular-bg pb-20">
      <div className="max-w-2xl mx-auto px-6 pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        {!batch ? (
          /* Not found */
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-3">
              Batch Not Found
            </h1>
            <p className="text-gray-400 mb-2">
              No verification data exists for batch ID: <code className="text-white font-mono bg-ink-3 px-2 py-1 rounded">{batchId}</code>
            </p>
            <p className="text-sm text-gray-500 mb-8">
              This batch either hasn&apos;t been submitted for verification yet, or the ID may be incorrect.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/"
                className="btn-glow px-6 py-3 bg-emerald text-white font-medium rounded-lg"
              >
                Browse Vendors
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition-all"
              >
                Report Issue
              </Link>
            </div>
          </div>
        ) : (
          /* Verification result */
          <div>
            {/* Status header */}
            <div className={`p-8 rounded-2xl mb-6 border ${
              batch.status === "verified"
                ? "bg-emerald/5 border-emerald/20"
                : "bg-yellow-500/5 border-yellow-500/20"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  batch.status === "verified"
                    ? "bg-emerald/10 border border-emerald/20"
                    : "bg-yellow-500/10 border border-yellow-500/20"
                }`}>
                  {batch.status === "verified" ? (
                    <ShieldCheck className="w-8 h-8 text-emerald" />
                  ) : (
                    <Clock className="w-8 h-8 text-yellow-400" />
                  )}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-white mb-1">
                    {batch.status === "verified" ? "Batch Verified" : "Verification Pending"}
                  </h1>
                  <p className="text-gray-400">
                    {batch.status === "verified"
                      ? `This batch passed PepAssure verification. Last checked ${batch.lastVerified}.`
                      : "This batch has been submitted and is awaiting verification."}
                  </p>
                </div>
              </div>
            </div>

            {/* Batch details card */}
            <div className="p-6 bg-ink-2 border border-white/5 rounded-xl space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald" />
                Batch Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-ink rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Batch ID</p>
                  <p className="text-sm text-white font-mono">{batch.batchId}</p>
                </div>
                <div className="p-3 bg-ink rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Peptide</p>
                  <p className="text-sm text-white">{batch.peptideName}</p>
                </div>
                <div className="p-3 bg-ink rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vendor</p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/vendors/${batch.vendorSlug}`}
                      className="text-sm text-emerald hover:text-emerald-light transition-colors"
                    >
                      {batch.vendorName}
                    </Link>
                    {batch.vendorVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                    )}
                  </div>
                </div>
                <div className="p-3 bg-ink rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">PVS Score</p>
                  <p className="text-sm text-white font-bold">{batch.vendorScore}/100</p>
                </div>
              </div>

              {batch.status === "verified" && (
                <>
                  <div className="h-px bg-white/5" />

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-ink rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Purity</p>
                      <p className="text-sm text-emerald font-bold">{batch.purity}</p>
                    </div>
                    <div className="p-3 bg-ink rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Test Method</p>
                      <p className="text-sm text-white">{batch.method}</p>
                    </div>
                    <div className="p-3 bg-ink rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tested Date</p>
                      <p className="text-sm text-white">{batch.testedDate}</p>
                    </div>
                    {batch.grade && (
                      <div className="p-3 bg-ink rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Finnrick Grade</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-bold rounded-lg border ${gradeColors[batch.grade]}`}>
                          {batch.grade} — {batch.gradeLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  {batch.finnrickUrl && (
                    <a
                      href={batch.finnrickUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-emerald hover:text-emerald-light transition-colors"
                    >
                      View full Finnrick report <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400/80 leading-relaxed">
                This verification is for the specific batch ID shown above. Different batches from the same vendor may have different results. Always check the COA for your specific order. PepAssure provides verification data as a research service and does not make medical recommendations.
              </p>
            </div>

            {/* Share bar */}
            <div className="mt-6 flex items-center justify-between p-4 bg-ink-2 border border-white/5 rounded-xl">
              <p className="text-xs text-gray-500">
                Verification ID: <code className="text-gray-400">{batch.batchId}</code>
              </p>
              <p className="text-xs text-gray-600">
                pepassure.com/verify/{batch.batchId}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
