# PepAssure — Project Handoff to Claude Code

## TL;DR for the next agent

**Live site:** https://pepassure.com (Cloudflare Pages, project `pepassure`)
**What's live:** Two static HTML pages (homepage + for-vendors) deployed via a bash script. Marketing only — no auth, no backend wiring, claim/sales forms do nothing.
**What the user wants next:** A working vendor panel, auth, claim form, and admin panel, all backed by Supabase, so vendors can actually claim their listing and admins can review/approve.

This project is a **forked deploy**: there is a Next.js 15 scaffold in the repo that matches the long-term vision, but **it is not deployed anywhere**. The live site is the static HTML files. Reconciling these two branches is the first architectural decision you need to make. Read "Architecture decision required" below before writing any code.

---

## Current state

### 1. What is actually live on pepassure.com

The Cloudflare deploy script `🚀 Deploy PepAssure Cloudflare.command` builds a `pepassure_deploy/` directory containing exactly three files and uploads them via Cloudflare's direct-upload API:

- `pepassure_deploy/index.html`  ← copied from `pepassure_homepage_v2.html`
- `pepassure_deploy/for-vendors.html`  ← copied from `pepassure_for_vendors.html`
- `pepassure_deploy/_redirects` (Netlify-style routes for `/for-vendors`)

`pepassure_deploy/` is rebuilt from scratch every deploy — never edit it directly, your edits will be wiped.

**True sources for live marketing pages:**
- Homepage → `pepassure_homepage_v2.html` (~1700 lines, single file, inline CSS + JS)
- Vendors page → `pepassure_for_vendors.html` (~1000 lines, single file, inline CSS + JS)

The static pages already contain stubbed modals (claim listing, enterprise contact). Their submit handlers are placeholder functions that don't talk to Supabase.

### 2. What exists in the Next.js scaffold (not deployed)

```
app/
├── page.tsx                  (home — stub)
├── layout.tsx
├── globals.css
├── for-vendors/
│   ├── page.tsx              (56 lines, simple stub — NOT the live vendors page)
│   ├── page_new.tsx          (alternate version)
│   └── actions.js            (server actions — check what's in here)
└── admin/
    └── page.tsx              (25 lines — stub only)

components/
├── AuthModal.jsx             (266 lines — the most complete file; sign in/up)
├── ClaimModal.tsx            (2 lines — empty stub)
├── ContactModal.tsx
└── ContactSalesModal.jsx

lib/supabase/
├── client.js                 (browser client via @supabase/ssr)
└── server.js                 (server client via @supabase/ssr)
```

**Important:** `lib/supabase/*.js` import from `@supabase/ssr`, but `package.json` only lists `@supabase/supabase-js`. You will need to `npm install @supabase/ssr` before anything builds.

### 3. Supabase

**Project URL:** `https://atyaqyotrntnfchhdzvw.supabase.co`
**Anon key (publishable):** `sb_publishable_fQsKvj_UW2Zwcjt0_bb1Tg_Dhjedkht`
(Both are hardcoded in the deploy script at line 7–8 — the static pages inject these at build time via the `%%SUPABASE_URL%%` / `%%SUPABASE_ANON_KEY%%` placeholders in a `sed` step.)

**Service role key:** NOT in the repo. You will need to ask the user for it (or have them add it to `.env.local`) before anything admin-side works.

**Schema:** `SUPABASE_COMPLETE_SETUP.sql` in the project root defines:
- `claim_requests` — public, anon-insertable claim form submissions (for the unclaimed flow)
- `sales_inquiries` — enterprise contact form
- `vendor_claims` — authenticated vendor-owned claims (RLS: user can only see their own)
- `vendor_scores` — the ranking data (truncated in the file I inspected, read the full file)

**Verify before building:** run a quick `select count(*) from claim_requests;` via a Node script or the Supabase dashboard to confirm the schema is actually applied. The SQL file exists but may never have been run. If the tables don't exist, tell the user and have them run the SQL in the Supabase SQL Editor (paste-and-run).

### 4. Deploy pipeline

**Script:** `🚀 Deploy PepAssure Cloudflare.command` (macOS bash, uses `sed -i ''`)
**What it does:**
1. Verifies Cloudflare token (hardcoded — token prefix `cfut_`)
2. Fetches account ID
3. Rebuilds `pepassure_deploy/` from the two source HTML files
4. Injects Supabase credentials via `sed`
5. Uploads via Cloudflare direct-upload API (pure Python, no wrangler)
6. Creates a deployment on the `pepassure` project, branch `main`

**Custom domain:** `pepassure.com` is attached to the Cloudflare Pages `pepassure` project. Each deploy creates a `*.pepassure.pages.dev` preview URL and promotes to production.

The script works from the user's Mac but **not from a Linux sandbox** — `api.cloudflare.com` is blocked from the sandbox's outbound proxy. From Claude Code running on the user's Mac, `bash './🚀 Deploy PepAssure Cloudflare.command'` will work.

### 5. Recent changes (context for what the user has been iterating on)

- Added a global search bar + filter panel to the homepage hero (live, verified)
- Added a Pro tier ($99/mo, "Most Popular") to the for-vendors page and changed Enterprise from $599 → $299
- Strengthened card hover effects with emerald glow + scale, added a molecular SVG background to the homepage, polished the sticky header with animated emerald underlines on nav links

All deployed and live.

---

## Architecture decision required (make this call first)

You have three options for shipping auth + claim form + vendor panel + admin panel. **Don't start coding until you've picked one and confirmed with the user.**

### Option A — Next.js app replaces static HTML (recommended long-term)
Migrate the current inline-CSS/JS static pages into `app/page.tsx` and `app/for-vendors/page.tsx`, add `/login`, `/dashboard`, `/admin` routes, deploy the Next.js app to Cloudflare Pages (with `@cloudflare/next-on-pages`) or Vercel.

- ✅ Single source of truth, real auth middleware, server actions for RLS-safe inserts
- ✅ Admin panel gets real server-side auth, not client-side checks
- ❌ Requires rebuilding the homepage and vendors page as React components — the user has been iterating on the HTML files live and has strong opinions about the design (emerald glow, molecular bg, search bar in hero). You must preserve all of it pixel-for-pixel.
- ❌ Deploy pipeline changes completely — the current `.command` script becomes obsolete

### Option B — Keep static HTML, add Next.js app at a subdomain/subpath
Keep `pepassure_homepage_v2.html` and `pepassure_for_vendors.html` as they are. Deploy the Next.js app to `app.pepassure.com` or `pepassure.com/app/*` for the authenticated surfaces (login, claim dashboard, admin). Static HTML's "Claim Listing" button opens a modal that either (a) submits directly to Supabase via the browser client (anon key, `claim_requests` table, RLS policy `Anon can insert claim requests` is already written) or (b) redirects to `app.pepassure.com/claim`.

- ✅ Zero risk to the live marketing pages the user has been polishing
- ✅ Quicker path to "it works"
- ❌ Two codebases to maintain, two deploy pipelines
- ❌ Auth state can't easily be shared between static pages and the Next.js app

### Option C — Hybrid: static HTML + Supabase JS directly in the HTML
Wire the existing modals in the HTML files to Supabase using the browser SDK (`@supabase/supabase-js` via CDN script tag). Claim form → `claim_requests` insert. Enterprise contact → `sales_inquiries` insert. Build the **admin panel** and **authenticated vendor dashboard** as new HTML files in the same deploy (`admin.html`, `dashboard.html`) protected by Supabase auth checked in client-side JS.

- ✅ Zero new infrastructure, uses the existing deploy pipeline untouched
- ✅ Fastest to ship
- ❌ Client-side-only auth checks on the admin panel = trivially bypassable. You MUST enforce everything with RLS policies on Supabase and never trust the client. Service-role operations are impossible without a server (you'd need a small serverless function for the "approve claim" action).
- ❌ Not idiomatic — no SSR, no route protection, no server actions

**My recommendation:** Ask the user. Then default to **Option C for v1** (ships in a day, uses what's already live) with a **migration path to Option A** once the feature set settles. The user has been iterating on the HTML pages and shipping fast — forcing a Next.js migration mid-stream will frustrate them. But make the recommendation explicit and get buy-in.

---

## Work to do (after architecture decision)

### Phase 1 — Wire what already exists
1. Confirm the Supabase schema is applied (run `SUPABASE_COMPLETE_SETUP.sql` in the dashboard if not). Verify `claim_requests`, `sales_inquiries`, `vendor_claims`, `vendor_scores` tables all exist.
2. Wire the existing claim modal in `pepassure_for_vendors.html` to insert into `claim_requests` (table is already anon-writable via RLS).
3. Wire the existing enterprise contact modal to insert into `sales_inquiries`.
4. Test both submit paths end-to-end. Check rows appear in the Supabase table editor.
5. Deploy, verify live.

### Phase 2 — Auth + vendor dashboard
6. Decide auth method: magic link (email OTP) is simplest and matches the "verify ownership via email domain" promise already on the page. Supabase Auth supports this natively.
7. Build `/login` (or a login modal) — send magic link, handle callback.
8. Build `/dashboard` (authenticated vendor view): shows the vendor's `vendor_claims` row(s), lets them upload COAs, edit listing fields. Start minimal — one screen showing claim status.
9. RLS policies for `vendor_claims` (SELECT/INSERT) are already in the schema. Verify they work.

### Phase 3 — Admin panel
10. Build `/admin` — list of pending `claim_requests` with approve/reject buttons.
11. Approve flow: creates a `vendor_claims` row linked to the user that owns the email, updates `claim_requests.status = 'approved'`, triggers a notification email (can defer).
12. **Critical:** admin actions must go through a server-side path with the service role key (never expose it to the browser). If you went with Option C (client-only), you need a Cloudflare Pages Function or Supabase Edge Function for this. If Option A or B, a Server Action / Route Handler is fine.
13. Guard the admin route with a `role = 'admin'` check. Simplest implementation: a `profiles` table or a `user_roles` table; set the user's role manually in the Supabase dashboard for the first admin.

### Phase 4 — Polish + production-ready
14. Add email ownership verification for claims (send link to `contact_email`, confirm before approving).
15. Spam/rate limiting on the public claim form (Cloudflare Turnstile is free and integrates easily).
16. Error states, loading states, success confirmations in modals.
17. Audit log on admin actions.

---

## Known traps and gotchas

- **`pepassure_deploy/` is ephemeral.** Every deploy runs `rm -rf pepassure_deploy && mkdir pepassure_deploy` before repopulating. I lost about two hours during the previous session editing files in there that kept getting reverted. Always edit `pepassure_homepage_v2.html` and `pepassure_for_vendors.html` — they're the true sources.
- **There are ghost files.** `for-vendors.html`, `pepassure_for_vendors_backup.html`, `ForVendorsPage.jsx`, `app/for-vendors/page.tsx`, `app/for-vendors/page_new.tsx` all exist and look plausible but **are not the live source**. The deploy script (line 69) picks `pepassure_for_vendors.html` specifically. Same deal for the homepage — `pepassure_homepage_v2.html` wins over `pepassure_homepage.html`.
- **`@supabase/ssr` is missing from package.json** but is imported by `lib/supabase/*.js`. Run `npm install @supabase/ssr` before any Next.js work.
- **Supabase credentials are committed to the deploy script.** This is fine for the anon/publishable key (it's meant to be public), but the user may want to move it to `.env` hygiene later. The service role key is NOT in the repo — good.
- **Cloudflare API token is committed to the deploy script** (`cfut_Azqnv8...`). Leave it alone unless the user asks you to rotate it.
- **Existing CSS is inline and hand-written** (CSS custom properties, not Tailwind) on the marketing pages. If you migrate to React, don't blindly convert to Tailwind classes — the user has been iterating on specific emerald glow effects, molecular background, and sticky nav underline animations. Preserve them.
- **The homepage uses CSS variables heavily:** `--green: #10b981` is the emerald accent, `--teal: #06b6d4`, `--blue: #1a56db`, `--navy: #0a1628`. Keep these consistent if you touch styles.
- **The static HTML modals already exist** — `claimModal` and `salesModal` in `pepassure_for_vendors.html`, plus a search modal on the homepage. Check the inline JS near the bottom of each file for the existing form handlers before writing new ones. You're wiring existing buttons, not building new UI.
- **There's a `peptide-verify/` subdirectory** that appears to be a separate older project. Ignore it unless the user says otherwise.

---

## Useful commands

```bash
# Navigate to project
cd "/Users/joshuarush/Documents/Claude/Projects/new co"

# Install the missing Supabase SSR package
npm install @supabase/ssr

# Dev server for the Next.js app
npm run dev

# Deploy the live marketing pages (static HTML flow)
bash './🚀 Deploy PepAssure Cloudflare.command'

# Verify what's live
curl -s https://pepassure.com/ | grep -c 'v3 ENHANCEMENTS'
curl -s https://pepassure.com/for-vendors | grep -oE '\$[0-9]+' | sort -u
```

---

## What the user asked for verbatim

> "hand off the entire project to get the vendors panel, add auth, claim form, admin panel etc supabase so it works"

Translation: the vendor-facing flows need to actually function. A real person should be able to visit pepassure.com/for-vendors, click "Claim Free Listing," fill out the form, receive a verification email, sign in, land on a dashboard showing their listing, and upload a COA. An admin should be able to log in at /admin, see the queue of pending claims, and approve them.

Start with Phase 1 (wire the existing modals to Supabase). That's the shortest path to "something works end to end" and will surface whether the schema is actually applied, whether the anon key works, and whether the RLS policies behave. Everything else builds on that.

Good luck. Ping the user early with the architecture decision — don't spend an hour writing code before confirming the approach.
