---
description: "Task list for josephomidiora.com website v1 — 14-day launch"
---

# Tasks: josephomidiora.com — Website V1

**Branch**: `001-website-v1`

**Input**: [spec.md](./spec.md) | [plan.md](./plan.md)

**Prerequisites**: All 7 Open Questions from plan.md must be resolved before Phase 1 begins.

**Tests**: Test-first is mandatory per constitution Principle IV. Tests are written before implementation in every phase.

**Organization**: Tasks follow the 14-day launch plan from PRD §11, grouped by phase. User story references (US1–US6) enable independent validation of each audience journey.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase
- **[USn]**: User story traceability
- All paths relative to repository root

---

## Phase 1: Foundation (Days 1–2)

**Purpose**: Repository, hosting, toolchain, and design tokens in place. Nothing else can start until this phase is complete.

**⚠️ CRITICAL**: All subsequent phases depend on this phase being fully complete.

- [ ] T001 Create GitHub repository `josephomidiora-website` with branch protection on `main`
- [ ] T002 [P] Connect Netlify to GitHub repo; enable auto-deploy on push to `main`
- [ ] T003 [P] Register GitHub OAuth App for Decap CMS authentication; store Client ID and Secret in Netlify environment variables
- [ ] T004 Create `netlify.toml` with build command, publish directory, and form names for investor, founder, press
- [ ] T005 Create directory structure per plan.md Project Structure (all folders, no content yet)
- [ ] T006 [P] Write `css/tokens.css` — all design tokens from plan.md Design System Reference (colours, fonts, spacing, max-widths)
- [ ] T007 [P] Write `css/base.css` — CSS reset, body typography, Google Fonts `@import` with `font-display: swap` and `<link rel="preconnect">`
- [ ] T008 [P] Configure ESLint (flat config), Stylelint, and Prettier; add `.eslintrc`, `.stylelintrc`, `.prettierrc`
- [ ] T009 [P] Initialise Vitest + jsdom; write `vitest.config.js`; add npm scripts: `test`, `test:a11y`, `lint`, `build`
- [ ] T010 [P] Install axe-core and `@axe-core/playwright`; write a smoke a11y test that asserts zero violations on a stub HTML page
- [ ] T011 [P] Initialise Playwright; write `playwright.config.js` targeting `localhost:5000`

**Checkpoint**: `npm test` passes (smoke test). `npm run lint` passes. Netlify auto-deploy is confirmed on a push.

---

## Phase 2: Shared Components (Days 2–3)

**Purpose**: Reusable Web Components that appear on every page. Must be built and tested before page builds begin.

**⚠️ CRITICAL**: All page phases depend on these components.

### Tests — Write First, Confirm They Fail

- [ ] T012 [P] [All] Write unit tests for `<site-nav>` in `tests/unit/site-nav.test.js`: keyboard navigation, hamburger open/close, active link highlighting, `aria-expanded` state
- [ ] T013 [P] [All] Write axe-core test for `<site-nav>` in `tests/a11y/site-nav.a11y.test.js`
- [ ] T014 [P] [US3, US4] Write unit tests for `<essay-card>` in `tests/unit/essay-card.test.js`: renders title, date, pillar tag, description, link
- [ ] T015 [P] [US3, US4] Write axe-core test for `<essay-card>`
- [ ] T016 [P] [US1, US2, US3] Write unit tests for `<cta-button>` in `tests/unit/cta-button.test.js`: primary/secondary variants, hover state class, correct href
- [ ] T017 [P] [US1, US2, US3] Write unit tests for `<contact-form>` in `tests/unit/contact-form.test.js`: field validation, inline success message, inline error message
- [ ] T018 [P] [US1, US2, US3] Write axe-core test for `<contact-form>`: labels associated with inputs, error states announced, submit button accessible name

### Implementation

- [ ] T019 [All] Implement `<site-nav>` Web Component in `components/site-nav.js` — horizontal desktop nav, hamburger mobile overlay, EN|FR toggle, active-link signal colour (tests T012–T013 must pass)
- [ ] T020 [P] [All] Write `css/components.css` — nav, CTA button (primary/secondary), essay card, contact form, pillar tag, language toggle
- [ ] T021 [US2, US4] Implement `<essay-card>` Web Component in `components/essay-card.js` (tests T014–T015 must pass)
- [ ] T022 [US1, US2, US3] Implement `<cta-button>` Web Component in `components/cta-button.js` — primary and secondary variants (test T016 must pass)
- [ ] T023 [US1, US2, US3] Implement `<contact-form>` Web Component in `components/contact-form.js` — Netlify Forms submission, inline success/error feedback (tests T017–T018 must pass)
- [ ] T024 [P] [US5] Write `js/lang.js` — language toggle routing (EN ↔ FR equivalent path), active language indicator

**Checkpoint**: All component unit and a11y tests pass. Components render in isolation (open `tests/fixtures/component-preview.html`).

---

## Phase 3: User Story 1 — Investor Journey (Days 3–5)

**Goal**: Home page (investor routing) + Building page fully functional. Investor can arrive, evaluate Weyz and Avancier, and submit an enquiry.

**Independent Test**: Open Home → Building → Contact in that order. Complete investor contact form. Verify Netlify Forms receives submission.

### Tests — Write First

- [ ] T025 [P] [US1] Write Playwright E2E test in `tests/e2e/investor-journey.spec.js`: loads `/`, reads headline, clicks "Explore Weyz →", lands on `/building`, sees Weyz + Avancier sections, clicks "Talk to us about Weyz →", anchors to `#investor`, submits form, sees inline confirmation
- [ ] T026 [P] [US1] Write axe-core page test for `/` in `tests/a11y/home.a11y.test.js`
- [ ] T027 [P] [US1] Write axe-core page test for `/building` in `tests/a11y/building.a11y.test.js`

### Implementation

- [ ] T028 [US1] Author `index.html` — hero (headline, sub-line, three audience routing cards), "What I Build" section, "Latest Thinking" (3 essay card slots, static at first), "The Thesis" pull-quote block; import `<site-nav>`, `<cta-button>`
- [ ] T029 [US1] Author `building.html` — Weyz section (6 blocks: name+one-liner, Problem, Product, Current Stage, Why Now, CTA), Avancier section (4 blocks); equal visual weight; import `<site-nav>`, `<cta-button>`
- [ ] T030 [US1] Add `#investor` anchor section to `contact.html` — Investor form (Name, Organisation, Role, Email, Message) using `<contact-form>`; Netlify Forms attribute wired
- [ ] T031 [P] [US1] Write `css/pages.css` home and building page layout rules
- [ ] T032 [P] [US1] Add OG images for home (`images/og/home.png`) and building (`images/og/building.png`) — 1200×630px, dark bg, white headline, green accent
- [ ] T033 [P] [US1] Add all SEO meta tags to `index.html` and `building.html`: `<title>`, `<meta name="description">`, og tags, canonical, hreflang
- [ ] T034 [P] [US1] Add JSON-LD `Person` schema to `index.html` (also used on `/about`)

**Checkpoint**: Playwright investor-journey test passes. Axe-core reports zero violations on `/` and `/building`. Netlify Forms receives a test submission.

---

## Phase 4: User Story 2 — Founder / Essay Journey (Days 5–7)

**Goal**: Thinking page (essay index + individual essay) + Avancier CTA on Contact page. Founder can browse essays by pillar, read a full essay, and contact Avancier.

**Independent Test**: Open `/thinking`, filter by pillar, open one essay, read full content, click "Work with Avancier →", submit founder form.

### Tests — Write First

- [ ] T035 [P] [US2] Write Playwright E2E test in `tests/e2e/founder-journey.spec.js`: loads `/thinking`, clicks pillar filter, verifies filtered results, opens essay, reads content + related essays, navigates to `/contact#founder`, submits form, sees confirmation
- [ ] T036 [P] [US2] Write Playwright test for pillar filter edge case: filter returns zero results → "No essays in this pillar yet." message displayed
- [ ] T037 [P] [US2] Write unit test for read-time calculation in `tests/unit/read-time.test.js`: word count ÷ 200, ceiling, correct formatting ("3 min read")
- [ ] T038 [P] [US2] Write axe-core page test for `/thinking` and a sample essay page

### Implementation

- [ ] T039 [US2] Author `thinking.html` — page headline + sub-line, pillar filter buttons (5 pillars + "All"), essay list rendered from build script output; import `<site-nav>`, `<essay-card>`
- [ ] T040 [US2] Write essay filter logic in `js/nav.js` (or a dedicated `js/essays.js`) — show/hide cards by `data-pillar` attribute; zero-results state
- [ ] T041 [US2] Create essay page template in `scripts/build.js` — reads `content/essays/[slug].md`, extracts frontmatter (title, date, pillar, description, body, related_essays, fr_* fields), outputs `thinking/[slug].html` with: full rendered body, read time, pillar tag, share icons (LinkedIn, X — `aria-label` required), "Back to Thinking →", related essays block
- [ ] T042 [US2] Seed one real essay from Joseph (the first published essay, OQ-5) into `content/essays/[slug].md` and run `npm run build` to verify output
- [ ] T043 [US2] Add `#founder` anchor section to `contact.html` — Founder/Avancier form (Name, Company optional, Email, "What you're building") using `<contact-form>`; Netlify Forms attribute wired
- [ ] T044 [P] [US2] Add OG image for `/thinking` (`images/og/thinking.png`)
- [ ] T045 [P] [US2] Add SEO meta + JSON-LD `Article` schema to essay page template in build script
- [ ] T046 [P] [US2] Update "Latest Thinking" section on `index.html` — wire to the 3 most recent essays from build output (build script writes a `content/essays-manifest.json` listing all published essays reverse-chronological)

**Checkpoint**: Playwright founder-journey test passes. Pillar filter works. Essay renders with correct read time. axe-core zero violations.

---

## Phase 5: User Story 3 — Press Journalist Journey (Days 6–7)

**Goal**: About page with narrative bio, speaker bio, quick-facts sidebar, and Press section on Contact page.

**Independent Test**: Open `/about`, read all four prose sections, copy speaker bio, navigate to `/contact#press`, submit press enquiry.

### Tests — Write First

- [ ] T047 [P] [US3] Write Playwright E2E test in `tests/e2e/press-journey.spec.js`: loads `/about`, verifies four narrative section headings exist, verifies speaker bio block is present and non-empty, navigates to `/contact#press`, submits press form, sees inline confirmation
- [ ] T048 [P] [US3] Write axe-core page test for `/about` and `/contact`

### Implementation

- [ ] T049 [US3] Author `about.html` — four prose narrative sections (Lagos bus, Failures First, Erasmus Years, What I'm Building Now), professional photo with descriptive `alt`, quick-facts sidebar/block, Speaker Bio section at bottom; import `<site-nav>`
- [ ] T050 [US3] Add `#press` anchor section to `contact.html` — Press form (Name, Publication/Outlet, Email, Nature of Enquiry) using `<contact-form>`; Netlify Forms attribute wired
- [ ] T051 [P] [US3] Add JSON-LD `Person` schema to `about.html` (name, description, sameAs links to LinkedIn, X)
- [ ] T052 [P] [US3] Add OG image for `/about` and `/contact`
- [ ] T053 [P] [US3] Add SEO meta to `about.html` and `contact.html`

**Checkpoint**: Playwright press-journey test passes. Four narrative sections present. Speaker bio copyable. Press form submits. axe-core zero violations.

---

## Phase 6: User Story 4 — CMS Operational (Day 8)

**Goal**: Decap CMS configured and verified. Joseph can publish a new essay, edit company stage, and update site globals without developer help.

**Independent Test**: Joseph (or tester acting as Joseph) logs into `/admin` via GitHub OAuth, creates a draft essay, publishes it, verifies it appears at its URL. Then edits Weyz `current_stage`, saves, and verifies update on `/building`.

### Tests — Write First

- [ ] T054 [US4] Write Playwright E2E test in `tests/e2e/cms-publish.spec.js`: call build script with a fixture essay Markdown file, verify output HTML exists at expected path with correct content (title, date, pillar, read time, body)
- [ ] T055 [US4] Write unit test for build script edge cases in `tests/unit/build-script.test.js`: missing fr_body → essay excluded from FR output; draft status → essay excluded from all output; slug collision → build errors with clear message

### Implementation

- [ ] T056 [US4] Author `admin/config.yml` — Decap CMS config: GitHub backend, branch `main`, media folder `images/content`, Essay collection (all fields from FR-026), Company collection (two singletons: Weyz, Avancier), Site Globals collection
- [ ] T057 [US4] Author `admin/index.html` — standard Decap CMS HTML loader (one-liner from Decap docs)
- [ ] T058 [US4] Complete `scripts/build.js` — reads `content/essays/*.md`, parses frontmatter (gray-matter), renders body Markdown to HTML (marked.js), generates EN essay pages to `thinking/[slug].html`, generates FR essay pages to `fr/thinking/[slug].html` (only if fr_body populated), regenerates `sitemap.xml`, writes `content/essays-manifest.json`
- [ ] T059 [P] [US4] Add `netlify.toml` build command: `node scripts/build.js` (runs on every Netlify deploy)
- [ ] T060 [P] [US4] Add `robots.txt` — allow all, disallow `/admin`
- [ ] T061 [US4] Manual verification: Joseph logs into `/admin`, publishes first essay (OQ-5), confirms it appears at `/thinking/[slug]` after build

**Checkpoint**: Build script unit tests pass. CMS publish → build → live URL verified manually.

---

## Phase 7: User Story 5 — French Pages (Days 9–10)

**Goal**: All five French pages live with correct content, hreflang, `<html lang="fr">`, and language toggle functional.

**Independent Test**: Toggle EN → FR on every page. Verify French content renders, hreflang tags present, diacritics correct, FR essays appear on `/fr/thinking` only when fr_body is populated.

### Tests — Write First

- [ ] T062 [P] [US5] Write Playwright E2E test in `tests/e2e/language-toggle.spec.js`: toggle EN → FR on each of the 5 pages, verify correct URL, verify `<html lang="fr">` present, verify hreflang tags, verify FR content differs from EN content
- [ ] T063 [P] [US5] Write axe-core tests for all 5 French pages

### Implementation

- [ ] T064 [US5] Author `fr/index.html` — French Home page; all copy translated; `<html lang="fr">`; hreflang tags; language toggle "FR" highlighted
- [ ] T065 [US5] Author `fr/building.html` — French Building page; all company copy translated; FR CMS fields wired
- [ ] T066 [US5] Author `fr/thinking.html` — French Thinking page; essay index showing only essays with fr_body populated; pillar filter labels translated
- [ ] T067 [US5] Author `fr/about.html` — French About page; all four narrative sections translated; speaker bio in French (if available); quick-facts block translated
- [ ] T068 [US5] Author `fr/contact.html` — French Contact page; all three form sections translated; same Netlify Forms handlers
- [ ] T069 [P] [US5] Update build script to generate `fr/thinking/[slug].html` for essays with fr_body (already scaffolded in T058 — finalise and test)
- [ ] T070 [P] [US5] Add OG images for all 5 French pages (`images/og/fr-*.png`)

**Checkpoint**: Language toggle test passes on all 5 pages. FR essay index shows only translated essays. Zero axe-core violations on all FR pages.

---

## Phase 8: User Story 6 — Mobile QA (Day 11)

**Goal**: All pages fully functional at 375px. Hamburger nav, stacked layouts, tap targets, mobile forms all verified.

**Independent Test**: Open every page in a 375px viewport. Complete all three contact forms. Read a full essay. Toggle language. No horizontal scroll anywhere.

### Tests — Write First

- [ ] T071 [P] [US6] Write Playwright viewport tests in `tests/e2e/mobile.spec.js`: set viewport to 375×812, open each page, assert no horizontal overflow, assert hamburger nav present, assert audience cards stack vertically on home
- [ ] T072 [P] [US6] Write Playwright test: tap hamburger, overlay opens; tap nav link, overlay closes; verify correct navigation

### Implementation

- [ ] T073 [US6] Audit all CSS for mobile breakpoints; add/fix responsive rules in `css/pages.css` and `css/components.css` — audience cards stack, essay cards stack, quick-facts sidebar becomes summary block, nav collapses to hamburger
- [ ] T074 [P] [US6] Verify all tap targets ≥ 44×44px (form submit buttons, share icons, back links, pillar filter buttons); fix any that are smaller
- [ ] T075 [P] [US6] Verify form fields on mobile: labels visible above inputs (no placeholder-only labels), keyboard does not obscure submit button

**Checkpoint**: Playwright mobile tests pass. Manual test on real iOS or Android device confirms no horizontal scroll or broken layout.

---

## Phase 9: SEO, Performance & Analytics (Day 12)

**Purpose**: All SEO signals in place, Lighthouse targets met, analytics live.

- [ ] T076 [P] Verify all meta tags, OG tags, canonical tags, hreflang are present on every page — run automated check via Playwright scrape
- [ ] T077 [P] Verify `sitemap.xml` includes all published essay URLs and all 10 static pages; submit to Google Search Console
- [ ] T078 [P] Run Lighthouse CI on all 10 static pages: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90
- [ ] T079 [P] Fix any Lighthouse regressions identified in T078
- [ ] T080 [P] Install and verify analytics (Plausible or Fathom) — confirm pageview events firing on 3 test page loads
- [ ] T081 [P] Run bundle size check — confirm critical-path weight ≤ 200 KB uncompressed; optimise if over budget
- [ ] T082 [P] Verify Google Fonts fallback: block fonts in DevTools, confirm layout holds and body text is legible in system font

**Checkpoint**: Lighthouse CI gates all green. Analytics verified. Bundle budget within limit.

---

## Phase 10: Joseph Review & Content Polish (Day 13)

**Purpose**: Full walkthrough by Joseph. All copy reviewed, corrections applied, CMS tested by Joseph himself.

- [ ] T083 Joseph walks through all 10 pages (EN + FR) and marks corrections in a shared document
- [ ] T084 Apply all copy corrections identified in T083
- [ ] T085 Joseph tests CMS: logs in, creates a second test essay, verifies it appears live, then sets it to draft, verifies it disappears
- [ ] T086 Joseph tests all three contact forms end-to-end from his phone; verify emails received at correct addresses
- [ ] T087 [P] Final axe-core full-site run — zero violations required before launch
- [ ] T088 [P] Final ESLint + Stylelint + Prettier run — zero errors, zero warnings

**Checkpoint**: Joseph sign-off. Zero outstanding copy corrections. All quality gates passing.

---

## Phase 11: Launch (Day 14)

**Purpose**: Custom domain live, DNS propagated, site indexed, analytics confirmed.

- [ ] T089 Point josephomidiora.com DNS to Netlify (A record / CNAME per Netlify docs); confirm custom domain in Netlify settings
- [ ] T090 Enable HTTPS (Netlify auto-provisions Let's Encrypt); verify redirect HTTP → HTTPS
- [ ] T091 Verify site live at https://josephomidiora.com and https://www.josephomidiora.com (if applicable)
- [ ] T092 Trigger Google Search Console indexing request for all 10 static pages
- [ ] T093 Verify analytics receiving live traffic (first real session confirmed)
- [ ] T094 [P] Add site to Google Search Console; submit sitemap.xml URL
- [ ] T095 Final smoke E2E run against production URL: investor journey, founder journey, press journey, language toggle

**Checkpoint**: Site live, HTTPS active, analytics firing, Google Search Console submitted, smoke tests passing on production.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundation)**: No dependencies — start immediately after Open Questions resolved
- **Phase 2 (Components)**: Requires Phase 1 complete — blocks all page phases
- **Phases 3–5 (Investor, Founder, Press)**: Require Phase 2 complete; can run partially in parallel
- **Phase 6 (CMS)**: Requires Phase 4 complete (essay template needed for build script)
- **Phase 7 (French)**: Requires Phases 3–5 complete (translates all pages)
- **Phase 8 (Mobile QA)**: Requires Phases 3–7 complete
- **Phase 9 (SEO/Perf)**: Requires Phase 8 complete
- **Phase 10 (Review)**: Requires Phase 9 complete
- **Phase 11 (Launch)**: Requires Phase 10 sign-off

### User Story Dependencies

- **US1 (Investor)**: Can start after Phase 2 — no dependency on US2–US6
- **US2 (Founder/Essays)**: Can start after Phase 2 — needs build script (Phase 6 overlap)
- **US3 (Press)**: Can start after Phase 2 — no dependency on US1/US2
- **US4 (CMS)**: Requires essay template from US2
- **US5 (French)**: Requires all EN pages (US1–US3) complete
- **US6 (Mobile)**: Requires all pages and components complete

### Parallel Opportunities

- Within Phase 1: T006–T011 all [P]
- Within Phase 2: T012–T018 (test writing) all [P]; T020–T024 partial [P]
- Phases 3, 4, 5: Once Phase 2 complete, test writing tasks in all three phases can run in parallel
- Phase 9: All T076–T082 [P]

---

## Implementation Strategy

### MVP (Day 7 — internal review)

1. Phases 1–2 complete (foundation + components)
2. Phase 3 complete (investor journey, US1)
3. Phase 4 complete (founder/essay journey, US2)
4. Phase 5 complete (press journey, US3)
5. **STOP**: Internal review of EN site before FR and CMS work begins

### Launch (Day 14)

Complete all phases in order. Launch only after Phase 10 sign-off from Joseph.

---

## Notes

- [P] = parallel with other [P] tasks in same phase
- [USn] = user story traceability
- Tests MUST be written before implementation and confirmed failing first
- Commit after each task or logical group using Conventional Commits
- Stop at each phase Checkpoint to validate before proceeding
- OQ = Open Question from plan.md; any task that depends on an unresolved OQ is blocked
