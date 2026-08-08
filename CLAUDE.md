# Project Context — josephomidiora.com

Personal site for Joseph Omidiora. Vanilla HTML5 / CSS3 / JS ES2022+, native Web
Components, Decap CMS, Netlify, DeepL auto-translation (EN → FR). **No frameworks,
no bundler, no runtime dependencies.**

## Commands

```bash
npm run dev            # serve on http://localhost:5173
npm run build          # render essays + sitemap.xml + feed.xml + manifest
npm run lint           # eslint + stylelint — must be 0 errors
npm test               # vitest (unit + a11y)
npx playwright test    # e2e, chromium + webkit + mobile chrome
```

Port 5173, not 5000 — macOS AirPlay Receiver occupies 5000.

## Layout

| Path | What |
|---|---|
| `*.html` | Hand-written pages: index, building, thinking, now, uses, about, contact |
| `components/` | Web Components (Shadow DOM): `site-nav`, `cta-button`, `essay-card`, `contact-form`, `newsletter-form`, `hero-field`, `pixel-tetris` |
| `js/` | `theme.js` (light/dark), `lang.js` (EN/FR routing), `easter-egg.js` (lazy-loads the footer game) |
| `css/` | Load order matters: `tokens` → `base` → `components` → `pages` |
| `content/essays/*.md` | Essay source. Front-matter drives the build. |
| `scripts/build.js` | Renders essays to `thinking/`, regenerates sitemap + feed + manifest |
| `specs/001-website-v1/` | Spec, plan, tasks for the current feature |

**Generated, never committed** (see `.gitignore`): `thinking/`, `fr/`, `sitemap.xml`,
`feed.xml`, `content/essays-manifest.json`.

## Conventions that bite

- **Design tokens are the single source of truth** (`css/tokens.css`). No hard-coded
  colours or spacing in component styles.
- **Monospace is the primary voice.** JetBrains Mono for headings, nav, labels and
  metadata; IBM Plex Sans only for long-form prose.
- **`--color-signal` is for fills and borders, never for text on a light surface** —
  it is 1.97:1 there. Use `--color-signal-ink` for text.
- Components style themselves inside Shadow DOM. Do not add light-DOM class rules
  for component internals; outer CSS cannot reach them.
- Every user-visible string on a page must have an FR counterpart path.

## Governance

Read `.specify/memory/constitution.md` before implementing. All **10** principles
(I–X) are non-negotiable — especially accessibility (WCAG 2.1 AA, zero axe
violations), test coverage (≥ 80%), and the performance budgets.

An ADR in `.specify/decisions/` is required *before* introducing any dependency,
deviating from the stack, or changing URL/CMS schema.

## Spec Kit

Slash commands live in `.claude/commands/`: `/speckit.specify`, `.plan`, `.tasks`,
`.implement`, `.clarify`, `.analyze`, `.checklist`, `.constitution`, `.taskstoissues`,
and the git helpers `.git.commit`, `.git.feature`, `.git.initialize`, `.git.remote`,
`.git.validate`.

## Known gaps

- CSS ships ~40 KB uncompressed against a 20 KB budget (9 KB gzipped). Either add a
  minify step (needs an ADR) or amend the gate to measure gzipped bytes.
- `admin/config.yml` declares `companies` and `globals` collections whose content
  files do not exist, and `scripts/build.js` does not consume them.
- No FR pages exist yet; `data-alt-href` targets are in place but unbuilt.
