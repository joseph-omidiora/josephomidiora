<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0 (major: three new mandatory sections, extended existing principles)
Added sections:
  - Security Baseline (VIII) — new mandatory section
  - Internationalisation / Localisation (IX) — new mandatory section
  - Privacy & Compliance (X) — new mandatory section
Extended sections:
  - Principle I (Performance-First) — sub-budgets for JS/CSS/fonts; multi-page Lighthouse; per-asset size gate
  - Principle III (Component-Driven Architecture) — design token governance (tokens.css SSOT, three-tier naming)
  - Principle VII (Observability & Maintainability) — error handling & resilience; ADR requirement; CHANGELOG
Quality Gates: added npm audit, secret scan, i18n coverage, asset size, CSP validity rows
Templates resolved:
  - .specify/templates/plan-template.md    ✓ resolved — Constitution Check section with per-principle checkboxes
  - .specify/templates/spec-template.md   ✓ resolved — a11y + perf acceptance criteria + Open Questions section
  - .specify/templates/tasks-template.md  ✓ resolved — a11y-audit and perf-budget task types added
Deferred TODOs: none
-->

# Glory Constitution

## Core Principles

### I. Performance-First

Performance is a design constraint, not an afterthought. Every decision — from markup structure to asset delivery — MUST be evaluated against Core Web Vitals targets.

- LCP MUST be ≤ 2.5 s on a simulated 4G mobile connection (Lighthouse throttled).
- CLS MUST be < 0.1 across all pages.
- INP MUST be ≤ 200 ms.
- Total page weight (uncompressed) MUST NOT exceed 200 KB for the critical path.
- Sub-budgets within the critical path: JavaScript (total parsed + executed) ≤ 50 KB; CSS ≤ 20 KB; web fonts ≤ 60 KB (WOFF2 only; `font-display: swap` is mandatory on every `@font-face` declaration).
- Images MUST use modern formats (WebP/AVIF), be lazy-loaded below the fold, and carry explicit `width`/`height` attributes to prevent layout shift. Each individual image MUST NOT exceed 100 KB; any exception requires written justification in the PR.
- No render-blocking scripts. All non-critical JS MUST be `defer`red or `async`.
- Lighthouse CI MUST be run against at least two representative pages (home page + one content page) on every PR that touches layout, CSS, images, or scripts. Running it only on the index is insufficient.
- Third-party scripts are prohibited unless the performance impact is explicitly approved and documented in the relevant spec.

### II. Accessibility (NON-NEGOTIABLE)

Every user, regardless of ability, MUST be able to use this site. WCAG 2.1 Level AA is the minimum standard; Level AAA is the target wherever achievable without compromising other principles.

- All interactive elements MUST be reachable and operable via keyboard alone, in a logical tab order.
- All images, icons, and media MUST carry meaningful `alt` text or `aria-label`; decorative elements MUST use `alt=""` or `aria-hidden="true"`.
- Color contrast ratio MUST meet 4.5:1 for normal text and 3:1 for large text and UI components.
- Dynamic content changes MUST announce appropriately via ARIA live regions or focus management.
- The site MUST pass automated accessibility audits (axe-core or equivalent) with zero violations before any merge.
- Manual screen-reader testing (VoiceOver/NVDA) MUST be performed on any component that handles user interaction.
- `prefers-reduced-motion` MUST be respected; all animations MUST be gated behind a `@media (prefers-reduced-motion: no-preference)` query.

### III. Component-Driven Architecture

The UI MUST be composed of discrete, self-contained units. No feature ships as a monolithic block of markup.

- Every distinct UI pattern is a **Web Component** (Custom Elements API). Components encapsulate their own HTML, CSS (within a `<template>` or Shadow DOM), and JS behavior.
- A component MUST have a single, clear responsibility. Components that do two things are two components.
- Components MUST expose a documented public API (attributes, properties, events). Internal implementation details MUST NOT be relied upon by consumers.
- CSS custom properties MUST be used for all themeable values (colors, spacing, type scale). Hard-coded values are prohibited in component styles.
- Components MUST be independently renderable in isolation (i.e., without requiring the full page context) for testing and documentation purposes.

**Design Token Governance**

- A single source-of-truth token file (`src/styles/tokens.css`) holds every custom property used across the project. All other stylesheets import from it; no custom property is defined outside it.
- Token naming follows a three-tier convention: `--{category}-{role}-{modifier}` — e.g., `--color-brand-primary`, `--spacing-layout-gap`, `--type-body-size`.
- Adding a new token requires a one-line explanation in the PR description stating why an existing token cannot serve the purpose. PRs that add tokens without justification are blocked.

### IV. Test-First Development (NON-NEGOTIABLE)

No implementation code is written before a failing test exists for it. This is non-negotiable and enforced at code review.

- The Red-Green-Refactor cycle is mandatory:
  1. Write a failing test that captures the intended behavior.
  2. Get explicit sign-off from the team that the test reflects the spec.
  3. Implement the minimum code required to make the test pass.
  4. Refactor without breaking the test.
- Unit tests cover all JS modules and Web Component logic (Vitest + jsdom).
- Integration tests cover component interactions and DOM-level behavior.
- Accessibility tests (axe-core) run as part of the test suite on every component.
- Test coverage MUST NOT drop below 80 % for statements, branches, and functions.
- Tests MUST be collocated with the code they cover (`component.test.js` alongside `component.js`).

### V. Semantic HTML & Progressive Enhancement

The site MUST work without JavaScript and without CSS before enhancements are layered on top.

- Use the most semantically correct HTML element for every purpose. Never use a `<div>` or `<span>` where a semantic element (`<nav>`, `<article>`, `<button>`, `<section>`, etc.) applies.
- The baseline experience — readable content, functional navigation, usable forms — MUST be delivered in pure HTML.
- CSS is an enhancement layer; the layout MUST not be broken if CSS fails to load.
- JavaScript is an enhancement layer; all core content and navigation MUST function without it.
- Avoid inline styles. All visual styling belongs in stylesheets.

### VI. Simplicity Over Abstraction (YAGNI)

Build exactly what is needed. Do not design for hypothetical future requirements.

- No framework, build tool, or dependency is introduced unless its absence creates a concrete, present problem.
- Three similar code patterns do not automatically become an abstraction. An abstraction is introduced only when a fourth instance appears and the cost of divergence is measurable.
- Dependencies MUST be audited before introduction: bundle size, maintenance status, license, and security history are all required considerations.
- Dead code MUST be deleted. Commented-out code is not committed.

### VII. Observability & Maintainability

The codebase MUST remain comprehensible to a developer returning after six months away.

- File and directory structure MUST be self-documenting. A new contributor MUST be able to locate any component or module within two minutes without asking for help.
- The `src/` tree follows a flat-then-nest rule: keep structure flat until nesting is justified by domain boundaries, not organizational preference.
- Every component MUST have a README-level doc block (within the file) covering: purpose, public API (attributes/properties/events), usage example, and known limitations.
- CSS architecture follows a utility-last methodology: global custom properties → layout primitives → component styles → utilities. No specificity wars.
- Commits MUST follow Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`).

**Error Handling & Resilience**

- Every async operation (fetch, CMS data load, translation request) MUST have an explicit error state rendered in the UI. Silent failures that leave the user with a blank or stale subtree are prohibited.
- Error boundaries at the Web Component level: a component that throws during rendering or an async operation MUST recover gracefully and display a meaningful fallback rather than an empty element.
- Each component's doc block MUST include an "Offline / degraded-network behaviour" entry that states what the component renders when its data source is unavailable.

**Architecture Decision Records**

- ADRs live in `.specify/decisions/` and are REQUIRED before work begins whenever: (a) a new dependency is introduced, (b) the implementation deviates from the stated stack, or (c) a change affects the public URL structure or Decap CMS schema.
- An ADR that has not been approved blocks the related PR from opening.

**Changelog**

- A `CHANGELOG.md` at the project root MUST be maintained following the Keep a Changelog format (`## [Unreleased]`, `## [x.y.z] - YYYY-MM-DD`, `### Added / Changed / Fixed / Removed`).
- Every merge to `main` MUST include a CHANGELOG entry in the same commit.

### VIII. Security Baseline

Security failures are bugs. Preventable vulnerabilities MUST be caught before they reach `main`.

**Content Security Policy**

- A strict CSP header MUST be declared in `netlify.toml` and reviewed on every PR that modifies script or style sources.
- `unsafe-inline` and `unsafe-eval` are prohibited in the CSP. Any exception requires a documented ADR and a specific hash or nonce instead.

**Subresource Integrity**

- Any asset loaded from a CDN or external origin MUST carry an `integrity` attribute (SRI hash) and a matching `crossorigin` attribute. Assets without SRI on external origins are blocked.

**Secrets Hygiene**

- No API keys, tokens, credentials, or private URLs MUST ever be committed to the repository.
- A secret-scanning tool (gitleaks or detect-secrets) MUST run as a pre-commit hook and as a CI gate. A detected secret blocks merge unconditionally.

**Dependency Audit**

- `npm audit --audit-level=high` MUST pass with zero high or critical vulnerabilities before any merge. This check is a required Quality Gate.
- Dependency upgrades that introduce regressions MUST be reverted; no `npm audit --force` or `--ignore-scripts` workarounds are permitted.

**DOM Safety**

- `textContent` is the default for injecting user-sourced or externally-sourced text into the DOM.
- Any use of `innerHTML`, `outerHTML`, or `insertAdjacentHTML` MUST be explicitly justified in the PR description and accompanied by evidence that the input is sanitised. Unsanitised `innerHTML` is a blocker.

### IX. Internationalisation & Localisation

The site serves English (primary) and French (DeepL auto-translation). The i18n architecture MUST support both locales without duplication of markup or logic.

**String Externalisation**

- Every user-visible string MUST be sourced from a locale data file (`src/locales/en.json`, `src/locales/fr.json`). Hard-coding display strings in HTML or JavaScript is prohibited.
- Components consume locale data via a documented locale-lookup function; they do not perform translation themselves.
- The DeepL translation pipeline operates on the locale JSON files, not on rendered HTML.

**Document Language**

- The `lang` attribute on `<html>` MUST reflect the active locale at all times and MUST be updated dynamically when the user switches locale. Using `lang="en"` as a static value on a French-language page is a violation.

**Locale-Aware Formatting**

- All locale-sensitive formatting — dates, numbers, list separators, currency — MUST use the `Intl` API (`Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.ListFormat`). Manual string concatenation for locale formatting is prohibited.

**RTL Readiness**

- No layout MUST rely on physical directional properties (`left`, `right`, `margin-left`, `padding-right`, etc.). CSS logical properties (`inline-start`, `inline-end`, `margin-inline-start`, etc.) MUST be used throughout so RTL support can be added without a layout rewrite.

**Translation Coverage Gate**

- A CI script MUST verify that every key present in `en.json` also exists in `fr.json` before merge. Missing keys in `fr.json` block the PR.

### X. Privacy & Compliance

User privacy is a design requirement, not a legal afterthought.

**Tracking & Analytics**

- No tracking pixels, analytics SDKs, or third-party cookies are permitted without a documented, GDPR-compliant consent mechanism approved in a separate ADR.
- If analytics are introduced, they MUST be self-hosted or privacy-first (e.g., Plausible, Fathom). Platforms that set third-party cookies or fingerprint users without consent are prohibited.
- The introduction of any analytics or tracking tool is subject to the complexity-budget rule in Principle VI.

**Crawlability & Discoverability**

- `robots.txt` and `sitemap.xml` MUST be maintained and kept accurate. Any PR that changes the public URL structure or adds/removes pages MUST update both files in the same commit.

**Data Minimisation**

- Forms and inputs MUST collect only the data explicitly required for their stated purpose. Optional fields MUST be labelled as optional. No field that is not acted upon by the system is permitted.

---

## Technology Standards

**Runtime**: Vanilla HTML5, CSS3 (Custom Properties, Grid, Flexbox), JavaScript ES2022+ (no transpilation target below the latest two versions of major evergreen browsers).

**Component System**: Native Web Components (Custom Elements v1, Shadow DOM, HTML Templates).

**Testing**: Vitest (unit + integration), axe-core (accessibility), Playwright (end-to-end).

**Linting & Formatting**: ESLint (flat config), Stylelint, Prettier. All checks MUST pass before a PR is opened.

**Build**: No bundler required for development. A minimal build step (esbuild or native browser modules) is permitted solely for production asset optimisation. No transpilers.

**Hosting / Deployment**: Static hosting (Netlify). No server-side runtime is permitted unless a separate ADR is ratified.

**Internationalisation**: Locale data in `src/locales/{locale}.json`; `Intl` API for formatting; DeepL pipeline targets JSON files only.

**Security tooling**: gitleaks or detect-secrets (pre-commit + CI); `npm audit` (CI); SRI on all CDN assets.

---

## Quality Gates

Every pull request MUST pass all of the following gates before merge. No exceptions.

| Gate | Tool | Threshold |
|---|---|---|
| Lint (JS) | ESLint | 0 errors, 0 warnings |
| Lint (CSS) | Stylelint | 0 errors |
| Formatting | Prettier | 0 diffs |
| Type checking | JSDoc + tsc `--checkJs` | 0 errors |
| Unit / integration tests | Vitest | All pass; coverage ≥ 80 % |
| Accessibility audit | axe-core (in Vitest) | 0 violations |
| End-to-end tests | Playwright | All pass |
| Lighthouse Performance | CI Lighthouse (≥ 2 pages) | Score ≥ 90 |
| Lighthouse Accessibility | CI Lighthouse (≥ 2 pages) | Score ≥ 95 |
| Lighthouse Best Practices | CI Lighthouse (≥ 2 pages) | Score ≥ 90 |
| Lighthouse SEO | CI Lighthouse (≥ 2 pages) | Score ≥ 90 |
| Bundle budget | esbuild / CI check | Critical path ≤ 200 KB uncompressed |
| Asset size budget | CI script | Each image ≤ 100 KB |
| npm audit | npm CLI | 0 high/critical vulnerabilities |
| Secret scan | gitleaks / CI | 0 detected secrets |
| i18n key coverage | CI script | `fr.json` covers 100 % of `en.json` keys |
| CSP validity | Lighthouse / CI | 0 CSP violations |

No gate may be skipped or suppressed with inline disable comments without a documented rationale in the PR description reviewed by a second contributor.

---

## Development Workflow

**Branching**: `main` is always deployable. All work happens on short-lived feature branches named `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, or `chore/<slug>`. Branches are deleted after merge.

**Branch numbering**: Sequential (per Spec Kit init options).

**Pull requests**: PRs are the only path to `main`. Self-merging is prohibited. Every PR MUST:
1. Reference a spec or task that justified the work.
2. Include a concise description of the change and why it was made.
3. Pass all quality gates (automated CI).
4. Receive at least one approving review.
5. Include a CHANGELOG.md entry.

**Spec before code**: No feature work begins without a written spec (`.specify/memory/`) describing the problem, acceptance criteria, Open Questions (resolved or explicitly deferred), and out-of-scope items. Specs MUST be reviewed and approved before implementation starts.

**ADR before deviation**: Any dependency introduction, stack deviation, or URL/CMS schema change requires an approved ADR in `.specify/decisions/` before the PR is opened.

**Commit discipline**: Commits are small and atomic — one logical change per commit. Commit messages follow Conventional Commits. Merge commits are forbidden; PRs are squash-merged or rebased.

---

## Governance

This constitution supersedes all other practices, guidelines, and informal conventions in this project.

**Amendments** require:
1. A written proposal documenting the motivation, the exact change, and any migration impact.
2. Review and approval before the change takes effect.
3. An update to `LAST_AMENDED_DATE` and a semantic version bump following the rules in Section IV of the agent spec.
4. Propagation to all dependent templates (`.specify/templates/`) within the same commit.

**Compliance**: Every PR review MUST verify that the proposed change does not violate any principle in this constitution. Non-compliance blocks merge.

**Complexity budget**: Any new dependency, abstraction, or architectural deviation from the stated stack MUST be justified with a concrete, present problem and documented in the PR. "We might need this later" is not justification.

**Living document**: This constitution is reviewed at the start of each significant project phase. Principles that no longer reflect the project's reality MUST be amended rather than silently ignored.

---

**Version**: 2.0.0 | **Ratified**: 2026-05-18 | **Last Amended**: 2026-05-26
