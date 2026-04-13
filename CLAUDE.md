# PepAssure — Project Context

## TL;DR

**Live site:** https://pepassure.com (Vercel, Next.js 15 App Router)
**Git repo:** `github.com/rush702/geneticpeptides.git` (remote: `vercel`)
**Branch deployed:** `feat/scrapers-scoring-nominations` (with bug fixes on `fix-audit-bugs`)
**Supabase project:** `https://atyaqyotrntnfchhdzvw.supabase.co`

The site is a full Next.js app with Supabase auth, server actions, Stripe integration stubs, and a vendor dashboard. It deploys automatically to Vercel on push.

---

## Project structure

```
app/                    # Next.js App Router pages
├── page.tsx            # Homepage — vendor rankings, search, compare
├── layout.tsx          # Root layout with Nav + Footer
├── for-vendors/        # Vendor landing + claim flow
├── most-wanted/        # Community nominations leaderboard
├── peptides/           # Peptide library with per-peptide vendor rankings
├── vendors/[slug]/     # Individual vendor detail pages
├── blog/               # Blog with [slug] routes
├── contact/            # Contact form (server action)
├── nominate/           # Vendor nomination form (server action)
├── admin/              # Admin dashboard (claims management)
├── dashboard/          # Authenticated vendor dashboard
├── login/              # Auth page
├── account/            # User account settings
├── about/              # About page
├── methodology/        # PVS scoring methodology
├── api-docs/           # Public API documentation
├── privacy/            # Privacy policy
├── terms/              # Terms of service
├── auth/               # Auth callback handler
├── actions/            # Server actions (claims, contact, nominations, reviews, stripe, admin, newsletter)
└── api/stripe/webhook/ # Stripe webhook endpoint

components/             # Shared React components
├── Nav.tsx             # Sticky nav with auth state
├── Footer.tsx          # Site footer with newsletter signup
├── AuthModal.tsx       # Sign in/up modal (magic link)
├── ClaimModal.tsx      # Vendor claim form modal
├── ContactModal.tsx    # Enterprise contact modal
├── ReviewModal.tsx     # Vendor review submission
├── NewsletterSignup.tsx
└── dashboard/          # Dashboard-specific components

lib/supabase/           # Supabase client setup
├── client.ts           # Browser client (@supabase/ssr)
└── server.ts           # Server client (@supabase/ssr)

scraper/                # Vendor data scrapers
scripts/                # Utility scripts
data/                   # vendor_data.json, last_scores.json
supabase/migrations/    # All SQL schema files

_archive/               # Obsolete files (old deploy scripts, HTML mockups, dead configs)
```

## Deployment

**Platform:** Vercel (auto-deploys on push to the `vercel` remote)
**Config:** `vercel.json` — Next.js framework, IAD1 region, security headers, cron jobs for reddit scraper + scoring

**Git remotes:**
- `origin` → `github.com/rush702/pepassure.com.git`
- `vercel` → `github.com/rush702/geneticpeptides.git` (this is what Vercel watches)

**To deploy:** `git push vercel <branch>`

## Supabase

**URL:** `https://atyaqyotrntnfchhdzvw.supabase.co`
**Anon key:** in `.env.local` (publishable, safe for browser)
**Service role key:** in `.env.local` (never expose to browser)

**Key tables:** `claim_requests`, `sales_inquiries`, `vendor_claims`, `vendor_scores`, `profiles`, `nominations`, `nomination_votes`, `reviews`, `newsletter_subscribers`

**Schema files:** `supabase/migrations/` contains all SQL (run in Supabase SQL Editor if tables are missing)

## Scraper

Two utility scripts remain in the project root:
- `🤖 Run Scraper.command` — runs Python scrapers, injects vendor data, redeploys
- `🤖 Run Scraper No Prompt.command` — auto-run variant

Scraper source is in `scraper/`. Run reports are in `scraper/scraper_run_report_*.md`.

## Style system

- **Tailwind CSS** with custom theme in `tailwind.config.ts`
- Custom colors: `ink` (bg), `ink-2`, `ink-3`, `emerald`, `emerald-light`
- Custom utilities: `text-gradient`, `molecular-bg`, `card-glow`, `btn-glow`, `modal-overlay`
- Font: Inter (body) + Playfair Display (headings via `font-display`)

## Known context

- The `_archive/` folder contains all old static HTML pages, 17 obsolete deploy scripts (Netlify/Cloudflare/Azure), duplicate configs, and the old `peptide-verify/` project. Archived April 2026 during cleanup.
- The homepage vendor data is currently hardcoded in `app/page.tsx` (module-level array). In production this should read from Supabase `vendor_scores`.
- Most Wanted page uses mock data with client-side voting (no persistence yet — needs a server action + Supabase `nomination_votes` table).
- Stripe integration is stubbed — checkout session creation exists but needs real price IDs.
