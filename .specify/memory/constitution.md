<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0 (initial ratification)
Added sections:
  - Core Principles (I–VII)
  - Technology Standards
  - Quality Gates
  - Development Workflow
  - Governance
Templates requiring updates:
  - .specify/templates/plan-template.md    ⚠ pending — add Constitution Check section
  - .specify/templates/spec-template.md   ⚠ pending — add a11y + perf acceptance criteria
  - .specify/templates/tasks-template.md  ⚠ pending — add task types: a11y-audit, perf-budget
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
- Images MUST use modern formats (WebP/AVIF), be lazy-loaded below the fold, and carry explicit `width`/`height` attributes to prevent layout shift.
- No render-blocking scripts. All non-critical JS MUST be `defer`red or `async`.
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

## Technology Standards

**Runtime**: Vanilla HTML5, CSS3 (Custom Properties, Grid, Flexbox), JavaScript ES2022+ (no transpilation target below the latest two versions of major evergreen browsers).

**Component System**: Native Web Components (Custom Elements v1, Shadow DOM, HTML Templates).

**Testing**: Vitest (unit + integration), axe-core (accessibility), Playwright (end-to-end).

**Linting & Formatting**: ESLint (flat config), Stylelint, Prettier. All checks MUST pass before a PR is opened.

**Build**: No bundler required for development. A minimal build step (esbuild or native browser modules) is permitted solely for production asset optimization. No transpilers.

**Hosting / Deployment**: Static hosting. No server-side runtime is permitted unless a separate architecture decision record (ADR) is ratified.

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
| Lighthouse (Performance) | CI Lighthouse | Score ≥ 90 |
| Lighthouse (Accessibility) | CI Lighthouse | Score ≥ 95 |
| Lighthouse (Best Practices) | CI Lighthouse | Score ≥ 90 |
| Lighthouse (SEO) | CI Lighthouse | Score ≥ 90 |
| Bundle budget | esbuild / CI check | Critical path ≤ 200 KB uncompressed |

No gate may be skipped or suppressed with inline disable comments without a documented rationale in the PR description reviewed by a second contributor.

## Development Workflow

**Branching**: `main` is always deployable. All work happens on short-lived feature branches named `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, or `chore/<slug>`. Branches are deleted after merge.

**Branch numbering**: Sequential (per Spec Kit init options).

**Pull requests**: PRs are the only path to `main`. Self-merging is prohibited. Every PR MUST:
1. Reference a spec or task that justified the work.
2. Include a concise description of the change and why it was made.
3. Pass all quality gates (automated CI).
4. Receive at least one approving review.

**Spec before code**: No feature work begins without a written spec (`.specify/memory/`) describing the problem, acceptance criteria, and out-of-scope items. Specs MUST be reviewed and approved before implementation starts.

**Commit discipline**: Commits are small and atomic — one logical change per commit. Commit messages follow Conventional Commits. Merge commits are forbidden; PRs are squash-merged or rebased.

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

**Version**: 1.0.0 | **Ratified**: 2026-05-18 | **Last Amended**: 2026-05-18
