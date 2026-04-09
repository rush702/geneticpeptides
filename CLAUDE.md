# CLAUDE.md

Guidance for AI assistants (Claude Code and similar) working in this repository.

## Repository overview

This repository currently contains a single file: a self-contained HTML landing page for **Genetic Peptides USA**, a peptide e-commerce / catalog site. There is no build system, no package manager, no server-side code, and no test suite. All styling and (eventually) behavior live inside one document.

```
geneticpeptides/
└── gpusa   # HTML landing page (no extension)
```

Treat the repo as an early-stage static prototype. Do not invent tooling, directories, or configuration files that do not exist — if a task genuinely requires them, confirm with the user first.

## The `gpusa` file

- **Path:** `gpusa` (at repo root, no `.html` extension despite being an HTML document — `file(1)` reports `HTML document, ASCII text`).
- **Size:** ~10.8 KB, 418 lines as of the latest commit (`de75caf Create gpusa`).
- **Status — important:** the file is **incomplete**. It ends mid-CSS inside a `.modal-tabs { ... }` rule around line 418, with no closing `</style>`, `<body>`, or `</html>`. This appears to be a work-in-progress snapshot, not a bug to "quietly fix." If you are asked to extend or modify this file, continue from where it leaves off rather than rewriting prior sections, and flag the truncation to the user before doing a large restructure.
- **Preview:** browsers will render it if you open it directly, but because it is truncated some sections (modal tabs, modal body, scripts, closing tags) are missing. If you need to preview locally, you can temporarily copy it to `gpusa.html` — do **not** commit a renamed duplicate without being asked.

### Page structure (top to bottom)

1. `<head>` — metadata, Google Fonts import (`Playfair Display` + `DM Sans`), and a single inline `<style>` block that holds the entire stylesheet.
2. `.nav` — fixed translucent top navigation with `.nav-brand`, `.nav-links` (`.nav-link`), and a `.btn-primary` CTA.
3. `.hero` — full-bleed dark gradient hero with a two-column `.hero-content` grid: headline / description / `.hero-buttons` on the left, a `.trust-grid` of `.trust-item` cards on the right.
4. `.trust-ribbon` — red accent bar of `.trust-ribbon-item`s under the hero.
5. `.products-section` — `.section-header` (label, title, subtitle), `.filters` row of `.filter-btn`s, and a responsive `.products-grid` of `.product-card`s. Each card has a dark `.product-header` (title, subtitle, price, `.purity-pill`), a `.product-body` (description, `.product-info` rows, `.product-tags`, `.product-buttons` with a `.btn-coa` certificate-of-analysis button).
6. `.modal` / `.modal-content` — modal shell with `.modal-header`, `.verified-badge`, and `.modal-tabs` (**cut off here**).

### Design tokens

All colors are declared as CSS custom properties on `:root`. Reuse these rather than hard-coding hex values:

| Token      | Value       | Use                                       |
|------------|-------------|-------------------------------------------|
| `--navy`   | `#0d1b3e`   | Primary brand color, nav text, CTAs       |
| `--red`    | `#c41e3a`   | Accent, section labels, `.btn-coa`, ribbon |
| `--blue`   | `#1a3a6e`   | Secondary brand, gradient midstop, tags   |
| `--cream`  | `#f8f7f4`   | Page background                           |
| `--light`  | `#eef0f5`   | Info-box backgrounds                      |
| `--text`   | `#1a1a2e`   | Body text                                 |
| `--muted`  | `#6b7080`   | Secondary text, descriptions              |

### Typography conventions

- **Headlines / serif:** `'Playfair Display', serif` — used for `.nav-brand`, `.hero h1`, `.section-title`, `.product-title`, `.product-price`, `.modal-title`. The hero headline uses `<em>` for italic color accents (`#7ba3d4`).
- **UI / sans:** `'DM Sans', sans-serif` — used for nav links, buttons, labels, descriptions, info rows, tags. Small UI labels are uppercase with `letter-spacing: 1.5px–3px` and `font-size: 10–12px`.
- **Body base:** `'Georgia', serif` is set on `<body>` as a fallback.

### Visual patterns to preserve

- `border-radius: 2px` on most controls/cards (not pill-shaped), `4px` on larger cards and the modal.
- Uppercase micro-labels (`.section-label`, `.info-label`, `.nav-link`, buttons) with wide letter-spacing.
- `rgba()` overlays on dark surfaces (hero, product header, modal header) rather than solid secondary colors.
- Hover interactions use `transition: ... 0.2s` (controls) or `0.25s ease` (cards), and `transform: translateY(-5px)` for card lift.
- Grids use `repeat(auto-fill, minmax(340px, 1fr))` for products and explicit `1fr 1fr` for hero/trust.

## Development workflow

### Previewing changes

There is no dev server. Open `gpusa` in a browser directly (`file://` URL) or serve the directory with any static server, e.g. `python3 -m http.server` from the repo root, then visit `http://localhost:8000/gpusa`.

### Editing guidelines

- **Prefer `Edit` over `Write`.** The file is long and mostly CSS; small targeted edits are easier to review.
- **Keep styles inline in the existing `<style>` block.** Do not split CSS into external files without explicit instruction — it would change the "single self-contained page" character of the project.
- **Reuse design tokens** (see table above) instead of introducing new hex colors.
- **Match existing class naming** (`kebab-case`, BEM-ish like `.product-header` / `.product-title` / `.product-subtitle`). Don't switch to utility-class frameworks (Tailwind, etc.) unless asked.
- **Don't add build tooling, package managers, linters, or frameworks** unless the user explicitly requests them. This repo has none and adding them is a substantial architectural change.
- **Don't create README.md, LICENSE, or other meta files** without being asked — the user has kept this repo deliberately minimal.

### When asked to "finish" or "complete" the page

Because the file is truncated mid-`.modal-tabs`, a natural completion would include:

1. Closing the `.modal-tabs` rule and adding `.modal-tab`, `.modal-body`, and related modal content styles.
2. Closing the `<style>` tag.
3. Adding the `<body>` with the structural elements the CSS already targets (`.nav`, `.hero`, `.trust-grid`, `.trust-ribbon`, `.products-section`, `.products-grid`, `.product-card`s, `.modal`).
4. Adding a small inline `<script>` for filter buttons and modal open/close behavior (the CSS implies `.modal.active` is toggled imperatively, and `.filter-btn.active` is set via click).
5. Closing `</body></html>`.

Before doing a large completion, confirm scope with the user — they may only want a narrow change.

## Git workflow

- **Default branch:** `main`.
- **Feature work:** develop on task-specific branches (e.g. the current `claude/add-claude-documentation-Al3E9`). Do not push to `main` without explicit permission.
- **Commits:** short imperative messages, matching the existing style (`Create gpusa`). One logical change per commit.
- **Remote:** `origin` points at `rush702/geneticpeptides` on GitHub. GitHub interactions go through the `mcp__github__*` tools, not `gh` or the web API.
- **Pull requests:** only open a PR when the user explicitly asks for one.

## What this repo is **not**

To save future exploration time:

- No `package.json`, `node_modules`, `npm`/`pnpm`/`yarn` scripts.
- No bundler (Vite / webpack / Parcel / esbuild).
- No framework (React / Vue / Svelte / Next).
- No backend, database, API, or server code.
- No tests, CI configuration, linters, formatters, or pre-commit hooks.
- No images, fonts, or other assets checked into the repo — fonts load from Google Fonts via CDN.

If a task seems to assume any of the above, double-check the assumption with the user before acting on it.
