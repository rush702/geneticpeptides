# PeptideRank AI

Independent AI-powered ranking system for peptide research vendors.
Analyzes purity, reputation, customer service, COAs, and community
sentiment across every peptide research vendor. Updated daily.
No paid placements, ever.

## Stack


- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Backend:** Supabase (Postgres + Auth)
- **Hosting:** Vercel

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

**Option A — one-shot CLI (fastest):**

```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B — GitHub + Vercel dashboard:**

1. `git init && git add . && git commit -m "initial commit"`
2. Create a new repo on GitHub and `git push`
3. 
4. Import the repo at https://vercel.com/new
5. Add environment variables from `.env.example`
6. Deploy

## Project structure

```
app/
  layout.tsx         # Root layout + metadata
  globals.css        # Tailwind + base styles
  page.tsx           # Homepage
  for-vendors/       # /for-vendors route
  admin/             # /admin route
components/          # Shared React components
lib/supabase/        # Supabase clients
```

## Disclaimer

All content is for research use only. Not for human consumption.
