"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Key,
  Zap,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Lock,
  Webhook,
  Code2,
  FileJson,
  Shield,
  Crown,
} from "lucide-react";

/* ─── Endpoints data ─── */
const endpoints = [
  {
    method: "GET",
    path: "/v1/vendors",
    description: "List all verified vendors, sorted by PVS score",
    auth: "Required",
    example: `curl https://api.pepassure.com/v1/vendors \\
  -H "Authorization: Bearer pvs_live_sk_..."`,
    response: `{
  "data": [
    {
      "slug": "novapeptides",
      "name": "NovaPeptides",
      "score": 96,
      "purity": "99.4%",
      "verified": true,
      "tier": "pro",
      "location": "USA",
      "pillars": {
        "coa": 98,
        "purity": 99,
        "sentiment": 94,
        "transparency": 95,
        "experience": 92
      }
    }
  ],
  "total": 148,
  "page": 1
}`,
  },
  {
    method: "GET",
    path: "/v1/vendors/{slug}",
    description: "Get full details for a specific vendor",
    auth: "Required",
    example: `curl https://api.pepassure.com/v1/vendors/novapeptides \\
  -H "Authorization: Bearer pvs_live_sk_..."`,
    response: `{
  "slug": "novapeptides",
  "name": "NovaPeptides",
  "score": 96,
  "score_history": [85, 87, ... 96],
  "coa_count": 142,
  "sentiment": 94,
  "peptide_catalog": ["BPC-157", "TB-500", ...],
  "recent_coas": [...],
  "verified_at": "2024-02-01T10:00:00Z"
}`,
  },
  {
    method: "GET",
    path: "/v1/peptides",
    description: "List all peptides in the library with vendor counts",
    auth: "Required",
    example: `curl https://api.pepassure.com/v1/peptides?category=GLP-1 \\
  -H "Authorization: Bearer pvs_live_sk_..."`,
    response: `{
  "data": [
    {
      "slug": "semaglutide",
      "name": "Semaglutide",
      "category": "GLP-1",
      "vendor_count": 5,
      "molecular_weight": "4113.58 g/mol"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/v1/peptides/{slug}/vendors",
    description: "Get all vendors that sell a specific peptide, ranked by score",
    auth: "Required",
    example: `curl https://api.pepassure.com/v1/peptides/bpc-157/vendors \\
  -H "Authorization: Bearer pvs_live_sk_..."`,
    response: `{
  "peptide": "bpc-157",
  "vendors": [
    { "slug": "novapeptides", "score": 96, "rank": 1 },
    { "slug": "corepeptide", "score": 89, "rank": 2 }
  ]
}`,
  },
  {
    method: "POST",
    path: "/v1/coa/verify",
    description: "Submit a COA PDF for verification against our database",
    auth: "Enterprise only",
    example: `curl -X POST https://api.pepassure.com/v1/coa/verify \\
  -H "Authorization: Bearer pvs_live_sk_..." \\
  -F "file=@coa.pdf" \\
  -F "peptide=BPC-157" \\
  -F "batch_id=BPC-2024-0412"`,
    response: `{
  "verification_id": "ver_abc123",
  "status": "verified",
  "confidence": 0.98,
  "peptide_match": true,
  "purity_claim": "99.4%",
  "purity_verified": true,
  "notes": []
}`,
  },
  {
    method: "GET",
    path: "/v1/search",
    description: "Full-text search across vendors and peptides",
    auth: "Required",
    example: `curl "https://api.pepassure.com/v1/search?q=BPC-157" \\
  -H "Authorization: Bearer pvs_live_sk_..."`,
    response: `{
  "vendors": [{"slug": "novapeptides", "score": 96}],
  "peptides": [{"slug": "bpc-157", "name": "BPC-157"}]
}`,
  },
];

const errorCodes = [
  { code: 400, name: "Bad Request", description: "Invalid parameters or malformed request" },
  { code: 401, name: "Unauthorized", description: "Missing or invalid API key" },
  { code: 403, name: "Forbidden", description: "Endpoint requires Enterprise tier" },
  { code: 404, name: "Not Found", description: "Vendor or peptide doesn't exist" },
  { code: 429, name: "Rate Limited", description: "Too many requests — see X-RateLimit headers" },
  { code: 500, name: "Server Error", description: "Something went wrong on our end" },
];

const webhookEvents = [
  { event: "vendor.score_changed", description: "A vendor's PVS score changed by ≥1 point" },
  { event: "vendor.tier_upgraded", description: "A vendor upgraded to Pro or Enterprise" },
  { event: "coa.verified", description: "A submitted COA passed verification" },
  { event: "coa.rejected", description: "A submitted COA failed verification" },
  { event: "review.approved", description: "A community review was approved and published" },
];

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  POST: "bg-emerald/10 text-emerald border-emerald/20",
  PUT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
};

/* ─── Code block with copy button ─── */
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      {language && (
        <div className="absolute top-3 left-4 text-[10px] uppercase tracking-wider text-gray-600">
          {language}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 text-gray-500 hover:text-emerald transition-colors opacity-0 group-hover:opacity-100"
        title="Copy"
      >
        {copied ? <Check className="w-4 h-4 text-emerald" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className={`p-4 ${language ? "pt-8" : ""} bg-ink rounded-xl border border-white/5 overflow-x-auto`}>
        <code className="text-sm text-gray-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen molecular-bg pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-6">
            <Cpu className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">API Documentation</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            PepAssure <span className="text-gradient">REST API</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Programmatic access to vendor rankings, COA verification, and peptide data. Built for labs, research platforms, and quality tooling.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Enterprise plan required</span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        {/* Quick Start */}
        <section className="py-16 border-b border-white/5">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Quick Start
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              Your First API Call
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald/20 text-emerald text-xs font-bold flex items-center justify-center">1</span>
                Get your API key
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed pl-8">
                Upgrade to the Enterprise plan, then visit{" "}
                <Link href="/dashboard" className="text-emerald hover:text-emerald-light">Dashboard → Settings → API Access</Link>{" "}
                to generate your key. Keep it secret.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald/20 text-emerald text-xs font-bold flex items-center justify-center">2</span>
                Make a request
              </h3>
              <div className="pl-8">
                <CodeBlock
                  language="bash"
                  code={`curl https://api.pepassure.com/v1/vendors \\
  -H "Authorization: Bearer pvs_live_sk_YOUR_KEY"`}
                />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald/20 text-emerald text-xs font-bold flex items-center justify-center">3</span>
                Handle the response
              </h3>
              <div className="pl-8">
                <CodeBlock
                  language="json"
                  code={`{
  "data": [
    { "slug": "novapeptides", "score": 96, "verified": true },
    { "slug": "peptideworks", "score": 93, "verified": true }
  ],
  "total": 148
}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="py-16 border-b border-white/5">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Authentication
            </p>
            <h2 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              <Key className="w-7 h-7 text-emerald" />
              API Keys
            </h2>
          </div>

          <p className="text-gray-400 leading-relaxed mb-6">
            All API requests require a Bearer token in the <code className="px-1.5 py-0.5 bg-ink-3 text-emerald rounded text-sm font-mono">Authorization</code> header. Keys are scoped to your account and never expire unless rotated.
          </p>

          <div className="p-6 bg-ink-2 border border-white/5 rounded-xl mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">Request header format</h4>
            <CodeBlock code="Authorization: Bearer pvs_live_sk_1234567890abcdef" />
          </div>

          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-3">
            <Lock className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400 font-medium mb-1">Security</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Never expose API keys in client-side code or public repositories. Rotate immediately if compromised. Use server-side proxies for browser-based applications.
              </p>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="py-16 border-b border-white/5">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Rate Limits
            </p>
            <h2 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              <Zap className="w-7 h-7 text-emerald" />
              Limits by Plan
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="p-5 bg-ink-2 border border-white/5 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Enterprise</p>
              <p className="text-2xl font-bold text-white mb-1">10,000 / hour</p>
              <p className="text-xs text-gray-500">~2.8 req/sec sustained</p>
            </div>
            <div className="p-5 bg-ink-2 border border-white/5 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Enterprise + (custom)</p>
              <p className="text-2xl font-bold text-emerald mb-1">Unlimited</p>
              <p className="text-xs text-gray-500">Contact sales</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Rate limit headers are returned on every response:
          </p>
          <CodeBlock
            code={`X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9874
X-RateLimit-Reset: 1712793600`}
          />
        </section>

        {/* Endpoints */}
        <section className="py-16 border-b border-white/5">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Endpoints
            </p>
            <h2 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              <Code2 className="w-7 h-7 text-emerald" />
              REST Reference
            </h2>
          </div>

          <div className="space-y-6">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.path + endpoint.method}
                className="p-6 bg-ink-2 border border-white/5 rounded-xl"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${methodColors[endpoint.method]}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-white font-mono">{endpoint.path}</code>
                  {endpoint.auth === "Enterprise only" && (
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                      <Crown className="w-2.5 h-2.5" />
                      Enterprise only
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-4">{endpoint.description}</p>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Example request</p>
                    <CodeBlock code={endpoint.example} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Example response</p>
                    <CodeBlock code={endpoint.response} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Webhooks */}
        <section className="py-16 border-b border-white/5">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Webhooks
            </p>
            <h2 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              <Webhook className="w-7 h-7 text-emerald" />
              Real-Time Events
            </h2>
          </div>

          <p className="text-gray-400 leading-relaxed mb-6">
            Register webhook endpoints to receive real-time notifications when events happen on your vendors. Payloads are signed with HMAC-SHA256 using your webhook secret.
          </p>

          <div className="space-y-3 mb-6">
            {webhookEvents.map((event) => (
              <div
                key={event.event}
                className="flex items-center justify-between p-3 bg-ink rounded-lg border border-white/5"
              >
                <code className="text-sm text-emerald font-mono">{event.event}</code>
                <span className="text-xs text-gray-500 hidden sm:inline">{event.description}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Example payload</p>
          <CodeBlock
            language="json"
            code={`{
  "id": "evt_abc123",
  "type": "vendor.score_changed",
  "created": 1712793600,
  "data": {
    "vendor_slug": "novapeptides",
    "previous_score": 95,
    "new_score": 96,
    "delta": 1,
    "pillar_changes": {
      "coa": 0,
      "sentiment": 2
    }
  }
}`}
          />
        </section>

        {/* Error Codes */}
        <section className="py-16 border-b border-white/5">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Errors
            </p>
            <h2 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              <AlertCircle className="w-7 h-7 text-emerald" />
              HTTP Status Codes
            </h2>
          </div>

          <div className="space-y-2">
            {errorCodes.map((err) => (
              <div
                key={err.code}
                className="flex items-start gap-4 p-4 bg-ink-2 border border-white/5 rounded-lg"
              >
                <span className={`flex-shrink-0 w-14 text-center py-1 rounded-md font-mono text-sm font-bold ${
                  err.code < 300 ? "bg-emerald/10 text-emerald" :
                  err.code < 400 ? "bg-blue-500/10 text-blue-400" :
                  err.code < 500 ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  {err.code}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{err.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{err.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Error response format</p>
            <CodeBlock
              language="json"
              code={`{
  "error": {
    "code": "invalid_api_key",
    "message": "The provided API key is not valid.",
    "status": 401
  }
}`}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald/10 border border-emerald/20 mb-6">
            <Cpu className="w-8 h-8 text-emerald" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to build?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            API access is included in the Enterprise plan. Get in touch to learn more or upgrade today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/for-vendors#pricing"
              className="btn-glow flex items-center gap-2 px-6 py-3 bg-emerald text-white font-semibold rounded-xl hover:bg-emerald-light"
            >
              <Crown className="w-4 h-4" />
              View Enterprise Plan
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 px-6 py-3 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
