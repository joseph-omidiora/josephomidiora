# Implementation Plan: josephomidiora.com — Website V1

**Branch**: `001-website-v1` | **Date**: 2026-05-22 | **Spec**: [spec.md](./spec.md)

**Source PRD**: josephomidiora_website_prd_v1.docx (May 2026)

---

## Summary

Build a 5-page bilingual (EN + FR) personal website for Joseph Omidiora using vanilla HTML5, CSS3, and JavaScript. Content is managed via Decap CMS backed by GitHub. A lightweight Node.js build script converts Markdown content files to static HTML. Hosted on Netlify with auto-deploy on push. The site must be live within 14 days of Open Questions resolution.

---

## Technical Context

**Language/Version**: HTML5, CSS3 (Custom Properties, Grid, Flexbox), JavaScript ES2022+, Node.js 20+ (build script only)

**Primary Dependencies**:
- Decap CMS v3 (admin UI only, loaded at `/admin` — not in critical path)
- Netlify Forms (no backend; free tier ≤ 100 submissions/month)
- Plausible Analytics or Fathom (privacy-first; no cookie banner required)
- Google Fonts: Playfair Display 700/600, DM Sans 400/500/600

**Storage**: GitHub repository (Markdown files as content source of truth)

**Testing**: Vitest + jsdom (unit + component), axe-core (accessibility), Playwright (E2E)

**Target Platform**: Static hosting — Netlify free tier; CDN-delivered

**Performance Goals**: LCP ≤ 2.5 s, CLS < 0.1, INP ≤ 200 ms (4G throttled); Lighthouse Performance ≥ 90

**Constraints**: No server-side runtime; no framework; critical-path weight ≤ 200 KB uncompressed; no render-blocking scripts; Netlify Forms ≤ 100 submissions/month at free tier

**Scale/Scope**: 5 pages × 2 languages = 10 static pages + N essay pages (launch with ≥ 1); single developer build over 14 days

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Performance-First | ✅ | LCP/CLS/INP targets match PRD §9.3; bundle budget enforced in tasks |
| II. Accessibility | ✅ | WCAG 2.1 AA required; axe-core in test suite; all a11y requirements in FR-xxx |
| III. Component-Driven | ✅ | Nav, essay card, CTA button, contact form each built as isolated Web Components |
| IV. Test-First | ✅ | Tests written before implementation; axe-core per component |
| V. Semantic HTML | ✅ | HTML-first; JS enhances only (nav toggle, lang switch, form feedback) |
| VI. Simplicity | ✅ | No bundler at dev time; single-file build script; no framework |
| VII. Observability | ✅ | Conventional Commits; collocated test files; flat-then-nest directory |

**Complexity justifications required**: None. The build script (Node.js, MD → HTML) is the only non-trivial tooling addition; it replaces what would otherwise be manually maintained duplicate HTML files for bilingual content.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-website-v1/
├── spec.md              # Feature spec (user stories, requirements, success criteria)
├── plan.md              # This file
└── tasks.md             # Task list (created separately)
```

### Source Code (repository root)

```text
josephomidiora.com/
│
├── index.html                     # Home (EN)
├── building.html                  # Building (EN)
├── thinking.html                  # Essay index (EN)
├── thinking/
│   └── [slug].html                # Generated essay pages (EN) — build output
├── about.html                     # About (EN)
├── contact.html                   # Contact (EN)
│
├── fr/
│   ├── index.html                 # Home (FR)
│   ├── building.html              # Building (FR)
│   ├── thinking.html              # Essay index (FR)
│   ├── thinking/
│   │   └── [slug].html            # Generated French essay pages — build output
│   ├── about.html                 # About (FR)
│   └── contact.html               # Contact (FR)
│
├── css/
│   ├── tokens.css                 # Design tokens: colours, type scale, spacing
│   ├── base.css                   # Reset + typography base + font loading
│   ├── components.css             # Nav, CTA button, essay card, forms
│   └── pages.css                  # Page-specific layout overrides
│
├── js/
│   ├── nav.js                     # Mobile hamburger nav toggle (Web Component)
│   ├── lang.js                    # Language toggle routing logic
│   └── forms.js                   # Form submission + inline feedback
│
├── components/                    # Web Component definitions
│   ├── site-nav.js
│   ├── essay-card.js
│   ├── cta-button.js
│   └── contact-form.js
│
├── images/
│   ├── og/                        # OG images per page (1200×630 PNG)
│   └── content/                   # Documentary photos (WebP + JPG fallback)
│
├── content/
│   └── essays/                    # Markdown source files (CMS writes here)
│       └── [slug].md
│
├── admin/
│   ├── index.html                 # Decap CMS admin loader
│   └── config.yml                 # CMS collections config
│
├── scripts/
│   └── build.js                   # Node.js: reads content/essays/*.md → outputs HTML pages
│
├── tests/
│   ├── unit/                      # Vitest unit tests (collocated mirrors of components/)
│   ├── a11y/                      # axe-core accessibility tests per component/page
│   └── e2e/                       # Playwright end-to-end tests (audience journeys)
│
├── robots.txt
├── sitemap.xml                    # Auto-generated on build
└── netlify.toml                   # Netlify build config, redirects, form names
```

**Structure Decision**: Static site (HTML/CSS/JS). No backend or mobile layer. All pages are either hand-authored static HTML or build-script output from Markdown content files. Web Components live in `/components/` and are imported by pages that need them; the CSS cascade (tokens → base → components → pages) enforces the constitution's CSS architecture rule.

---

## Design System Reference

All visual decisions are locked to PRD §8. Key tokens implemented in `css/tokens.css`:

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#0D0D0D` | Hero bg, nav, dark surfaces |
| `--color-warm` | `#E8D5B0` | Sub-headlines, accent on dark |
| `--color-signal` | `#00C853` | CTAs, active nav, links, tags |
| `--color-slate` | `#2D4A6B` | Secondary headings, dividers |
| `--color-base` | `#F5F0E8` | Page backgrounds, card backgrounds |
| `--color-text` | `#2A2A2A` | All body copy |
| `--font-display` | `'Playfair Display'` | H1, H2 |
| `--font-body` | `'DM Sans'` | H3, body, captions |
| `--space-unit` | `8px` | All spacing is multiples of 8 |
| `--max-width` | `1200px` | Content container |
| `--essay-width` | `680px` | Essay body max-width |

---

## Open Questions — BLOCK BUILD START

All 7 open questions from PRD §13 must be resolved before Day 1. They are reproduced here for tracking:

| # | Question | Blocks | Deadline |
|---|---|---|---|
| OQ-1 | What email addresses should the 3 contact forms route to? | Netlify Forms config | Day 1 |
| OQ-2 | Is a documentary-style professional photo available? | Hero + About page | Day 3 |
| OQ-3 | What is the exact, honest current-stage description of Weyz (public)? | `/building` | Day 3 |
| OQ-4 | Who is writing French translations — Joseph or a translator? | `/fr/*` pages | Day 4 |
| OQ-5 | Which essay publishes first? Is it written? | `/thinking` launch | Day 4 |
| OQ-6 | Does a Netlify account exist? | Hosting setup | Day 1 |
| OQ-7 | Is josephomidiora.com registered? Is DNS access available? | Domain launch, Day 14 | Day 1 |

---

## Complexity Tracking

No constitution violations requiring justification. The build script introduces the only non-obvious decision: using Node.js to generate bilingual HTML from Markdown rather than maintaining 10+ duplicate HTML files by hand. This is justified by the bilingual + CMS requirement and the 14-day deadline — manual file maintenance would be error-prone and slower to update.
