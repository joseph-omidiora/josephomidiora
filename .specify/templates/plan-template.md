# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design. Non-compliance blocks merge.*

For each principle, check the box and add a one-line rationale or "N/A — [reason]".

- [ ] **I. Performance-First** — LCP ≤ 2.5 s, CLS < 0.1, INP ≤ 200 ms; JS ≤ 50 KB, CSS ≤ 20 KB, fonts ≤ 60 KB WOFF2; images ≤ 100 KB each; Lighthouse CI on ≥ 2 pages. _Rationale:_
- [ ] **II. Accessibility** — WCAG 2.1 AA minimum; axe-core 0 violations; keyboard-only operable; screen-reader tested; `prefers-reduced-motion` respected. _Rationale:_
- [ ] **III. Component-Driven Architecture** — each UI pattern is a Web Component with documented public API; all themeable values via CSS custom properties from `tokens.css`; new tokens justified. _Rationale:_
- [ ] **IV. Test-First Development** — failing test written and approved before implementation; coverage ≥ 80 %; axe-core in test suite. _Rationale:_
- [ ] **V. Semantic HTML & Progressive Enhancement** — works without JS and without CSS; no `<div>`/`<span>` where semantic element applies; no inline styles. _Rationale:_
- [ ] **VI. Simplicity (YAGNI)** — no new dependency/abstraction without a concrete present problem; bundle size, license, security audited. _Rationale:_
- [ ] **VII. Observability & Maintainability** — every async op has an error state; component doc block includes offline behaviour; ADR filed if applicable; CHANGELOG updated. _Rationale:_
- [ ] **VIII. Security Baseline** — CSP declared/reviewed; SRI on CDN assets; no secrets committed; `npm audit` passes; `textContent` preferred over `innerHTML`. _Rationale:_
- [ ] **IX. Internationalisation** — all strings in locale JSON; `lang` attribute dynamic; `Intl` API for formatting; logical CSS properties only; i18n coverage gate passes. _Rationale:_
- [ ] **X. Privacy & Compliance** — no tracking without consent ADR; `robots.txt` + `sitemap.xml` updated if URLs changed; only necessary data collected. _Rationale:_

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
