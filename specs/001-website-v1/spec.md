# Feature Specification: josephomidiora.com — Website V1

**Feature Branch**: `001-website-v1`

**Created**: 2026-05-22

**Status**: Draft — Pending Founder Review

**Source**: PRD v1.0 — josephomidiora_website_prd_v1.docx (May 2026)

---

## User Scenarios & Testing *(mandatory)*

Three primary audiences. Each has a distinct arrival path, intent, and required outcome. All six stories must be satisfied at launch. Stories 1–3 are P1 (audience journeys); Stories 4–6 are P2/P3 (operational and reach requirements).

---

### User Story 1 — Investor Evaluates Weyz Mobility (Priority: P1)

A VC, angel investor, or development finance institution has received a warm intro to Joseph or found him via LinkedIn. They open josephomidiora.com on desktop to do pre-call due diligence. Within 10 seconds they understand who Joseph is and what Weyz does. Within 3 minutes they have enough specificity to decide whether a call is worth their time.

**Why this priority**: This is the primary commercial purpose of the site. A failed investor journey blocks the most time-sensitive business outcome.

**Independent Test**: Navigate Home → Building → Contact#investor with no other pages built. The investor can read the thesis, evaluate both companies, and submit an investor enquiry form.

**Acceptance Scenarios**:

1. **Given** an investor lands on `/`, **When** they read above the fold, **Then** they see the headline "I build the payment infrastructure African transport runs on.", a Weyz-routing card "Explore Weyz →", and understand Joseph's positioning in under 10 seconds.
2. **Given** an investor arrives on `/building`, **When** they read the Weyz section, **Then** they see the current stage stated plainly (no vanity metrics), the problem, the product, a Why Now rationale, and a CTA "Talk to us about Weyz →" that routes to `/contact#investor`.
3. **Given** an investor is on `/contact#investor`, **When** they submit Name, Organisation, Role, Email, Message, **Then** the form confirms submission inline with "We'll be in touch." and the data is received via Netlify Forms.
4. **Given** an investor accesses the site on a 4G mobile connection, **When** the page loads, **Then** LCP is ≤ 2.5 s and the above-fold content is fully visible without scrolling on a 375px viewport.
5. **Given** no stock images are present on `/building`, **When** the investor views the page, **Then** all imagery is either product screenshots, team photos, infrastructure diagrams, or absent.

---

### User Story 2 — Founder / African Builder Reads Essays and Contacts Avancier (Priority: P1)

An early-stage African or diaspora founder has read a Joseph essay on LinkedIn and clicks through to josephomidiora.com. They want to read more of his thinking, assess whether Avancier can help their company, and potentially reach out.

**Why this priority**: Equal commercial priority to investor journey. The founder audience is also the Avancier client pipeline.

**Independent Test**: Navigate Home → Thinking → individual essay → Contact#founder. The founder can browse all essays by pillar, read a full essay with correct formatting, and submit a founder enquiry.

**Acceptance Scenarios**:

1. **Given** a founder lands on `/`, **When** they read the audience routing cards, **Then** they see "Read the Essays →" linking to `/thinking` as the clear path for their intent.
2. **Given** a founder is on `/thinking`, **When** the page loads, **Then** all published essays are listed reverse chronologically with title, date, pillar tag, 1–2 sentence description, and a "Read →" link; pillar filter buttons are visible.
3. **Given** a founder clicks a pillar filter (e.g., "Infrastructure Intelligence"), **When** the filter is applied, **Then** only essays tagged with that pillar are shown; all other essays are hidden.
4. **Given** a founder opens an individual essay, **When** the page renders, **Then** they see: full essay body rendered from Markdown, author (Joseph Omidiora), publish date, read time estimate (words ÷ 200, rounded up), pillar tag, LinkedIn and X share icons with `aria-label`, and a "Back to Thinking →" link at top and bottom.
5. **Given** a founder reaches the bottom of an essay, **When** they see related essays, **Then** 2 related essays are shown — either manually curated or from the same pillar if none are curated.
6. **Given** a founder navigates to `/contact#founder`, **When** they submit Name, Company (optional), Email, "What you're building" (open text), **Then** the form confirms inline and data is received via Netlify Forms.

---

### User Story 3 — Press Journalist Writes an Accurate Story (Priority: P1)

A journalist at TechCabal, Rest of World, or a European fintech publication is researching Joseph for an article. They need an accurate biography, verified company descriptions, a professional photo, and a fast route to request an interview.

**Why this priority**: Press coverage compounds. A bad or inaccessible press experience kills coverage opportunities permanently.

**Independent Test**: Navigate `/about` and `/contact#press`. Journalist can read the narrative bio, copy the third-person speaker bio, and submit a press enquiry.

**Acceptance Scenarios**:

1. **Given** a journalist lands on `/about`, **When** they read the page, **Then** they see four distinct narrative sections (Lagos bus, Failures First, Erasmus Years, What I'm Building Now) as prose — no bullet points.
2. **Given** a journalist needs a citable bio, **When** they scroll to the bottom of `/about`, **Then** they see a clearly labelled "Speaker Bio" section formatted in third-person prose, ready for copy-paste.
3. **Given** a journalist needs a photo, **When** they look at `/about`, **Then** one professional, documentary-style photo of Joseph is present with descriptive `alt` text.
4. **Given** a journalist navigates to `/contact#press`, **When** they submit Name, Publication/Outlet, Email, and Nature of Enquiry, **Then** the form confirms inline and data routes to the dedicated press email/form handler.
5. **Given** a journalist searches "Joseph Omidiora" on Google after launch, **When** the site is indexed, **Then** the `/about` page has a JSON-LD `Person` schema with correct name, description, and sameAs links.

---

### User Story 4 — Joseph Publishes a New Essay Without Developer Help (Priority: P2)

Joseph has written a new essay. He logs into the CMS at `/admin`, fills in the fields, sets the status to Published, and saves. The essay appears on `/thinking` and `/fr/thinking` (if French fields are filled) without any developer action.

**Why this priority**: CMS operability is a hard launch requirement. If Joseph can't publish independently, the site is a static brochure, not a living authority platform.

**Independent Test**: Log into Decap CMS at `/admin` using GitHub OAuth, create a new essay with all fields, set status to published, trigger a Netlify build, and verify the essay appears at its slug URL.

**Acceptance Scenarios**:

1. **Given** Joseph opens `/admin`, **When** he authenticates with GitHub OAuth, **Then** he is presented with the Decap CMS UI showing Essay, Company, and Site Globals content types.
2. **Given** Joseph creates a new essay and fills all required fields (title, slug, publish_date, pillar, description ≤ 160 chars, body in Markdown), **When** he clicks Publish, **Then** a commit is made to the GitHub repository and a Netlify build is triggered automatically.
3. **Given** the build completes, **When** any visitor navigates to `/thinking/[slug]`, **Then** the essay is visible with correct title, date, pillar tag, read time, and rendered Markdown body.
4. **Given** Joseph leaves `fr_body` empty, **When** the build runs, **Then** the essay does NOT appear on `/fr/thinking`.
5. **Given** Joseph sets an essay to `draft`, **When** the site builds, **Then** the essay is absent from all public URLs.
6. **Given** Joseph edits the Weyz `current_stage` field in the Company content type, **When** the build completes, **Then** the updated stage description appears on `/building`.

---

### User Story 5 — French-Speaking Visitor Uses the Full Site in French (Priority: P2)

An Erasmus alumni, European investor, or French-speaking African founder visits josephomidiora.com. They switch to French using the EN | FR toggle. All five pages are readable in French with correct hreflang, `<html lang="fr">`, and French typography support.

**Why this priority**: The Erasmus network and French-speaking African audiences are explicitly named target audiences. Bilingual is a launch requirement, not a nice-to-have.

**Independent Test**: Toggle EN → FR on every page. All five French pages render without English text fallbacks (except for content intentionally untranslated), hreflang tags are present, and French diacritics render correctly.

**Acceptance Scenarios**:

1. **Given** a visitor is on `/`, **When** they click "FR" in the language toggle, **Then** they are taken to `/fr/` with the same above-fold content rendered in French.
2. **Given** a visitor is on any French page, **When** they inspect the HTML, **Then** `<html lang="fr">` is present and `<link rel="alternate" hreflang="en">` and `<link rel="alternate" hreflang="fr">` are both in `<head>`.
3. **Given** a French essay exists (fr_body is populated), **When** a visitor navigates to `/fr/thinking`, **Then** the essay card appears; navigating to `/fr/thinking/[slug]` renders the French title, description, and body.
4. **Given** a French essay does NOT have fr_body populated, **When** a visitor is on `/fr/thinking`, **Then** the essay card is absent from the French index.
5. **Given** a visitor uses the language toggle on `/about`, **When** they switch EN → FR, **Then** the toggle navigates to `/fr/about` and the active language indicator ("FR") is highlighted with `#00C853`.

---

### User Story 6 — Mobile Visitor Has a Seamless Experience (Priority: P2)

A visitor opens josephomidiora.com on a smartphone (375px–430px viewport). Navigation, all pages, all forms, and all essay content are fully usable without horizontal scrolling, tiny tap targets, or broken layouts.

**Why this priority**: Mobile traffic will likely exceed desktop for this audience. A broken mobile experience undermines every other user story.

**Independent Test**: Open every page in a 375px viewport (Chrome DevTools or real device). All content readable, all tap targets ≥ 44×44px, hamburger nav opens and closes, forms submit successfully.

**Acceptance Scenarios**:

1. **Given** a visitor opens `/` on a 375px viewport, **When** the page loads, **Then** the three audience routing cards stack vertically, the hero headline is legible, and no horizontal scroll is present.
2. **Given** a mobile visitor taps the hamburger icon, **When** the menu opens, **Then** a full-screen overlay appears with large nav links (DM Sans, large size), and tapping any link closes the overlay and navigates correctly.
3. **Given** a mobile visitor is on a Contact form, **When** they tap each field, **Then** the native keyboard appears, labels are visible above inputs (not replaced by placeholder text), and the submit button is fully within the viewport.
4. **Given** a mobile visitor reads an essay, **When** they scroll, **Then** the essay body is rendered at max-width 680px centred, with 16px minimum tap targets on all interactive elements (share links, back links).

---

### Edge Cases

- What happens when an essay's `fr_body` is partially written (truncated mid-sentence)? Build must not fail; partial content renders as-is, not silently omitted.
- What happens when a pillar filter returns zero results? Display "No essays in this pillar yet." — no broken layout, no empty white space.
- What happens when a contact form submission fails (Netlify Forms error)? Display an inline error: "Submission failed. Please email [address] directly." — never a silent failure.
- What happens when `related_essays` slugs point to draft or deleted essays? The related essays section is omitted rather than rendering broken links.
- What happens when a new essay slug collides with an existing slug? The CMS slug field is immutable after first publish; the build script must error with a clear message rather than silently overwriting.
- What happens when Google Fonts fails to load? Body copy must still render in a legible system font fallback (`Georgia` for Playfair Display, `system-ui` for DM Sans). Layout must not break.

---

## Requirements *(mandatory)*

### Functional Requirements

**Navigation & Global**
- **FR-001**: All pages MUST include a top navigation bar with links: Home | Building | Thinking | About | Contact.
- **FR-002**: The active page MUST be indicated with a `#00C853` underline on the active nav link.
- **FR-003**: The language toggle (EN | FR) MUST be persistent in the top-right of all pages and navigate to the equivalent page in the other language.
- **FR-004**: Mobile navigation MUST be a full-screen overlay triggered by a hamburger icon; it MUST close on link tap or tap outside the menu.

**Home Page**
- **FR-005**: The hero MUST display the headline "I build the payment infrastructure African transport runs on." (Playfair Display 700, 56–72px, white on `#0D0D0D`).
- **FR-006**: Three audience routing cards MUST be present below the headline: Investors → `/building`, Founders → `/thinking`, Press → `/contact#press`.
- **FR-007**: The "Latest Thinking" section MUST show the 3 most recent published essays pulled from CMS (title, date, 1-sentence description, "Read →" link).
- **FR-008**: The "What I Build" section MUST display Weyz and Avancier summaries side-by-side (desktop) / stacked (mobile), each with a "Learn more →" link.

**Building Page**
- **FR-009**: Weyz Mobility MUST have six content blocks: company name + one-liner, Problem, Product, Current Stage, Why Now, and CTA → `/contact#investor`.
- **FR-010**: Avancier Technologies MUST have four content blocks: company name + one-liner, What We Do, Who We Serve, and CTA → `/contact#founder`.
- **FR-011**: Both companies MUST have equal visual weight on the page — no hierarchy implying one matters more.
- **FR-012**: The Weyz `current_stage` field MUST be editable by Joseph via CMS without developer involvement.

**Thinking Page**
- **FR-013**: The essay index MUST list all published essays in reverse chronological order with pillar filter buttons (5 pillars).
- **FR-014**: Each essay card MUST display: pillar tag, title, date, 1–2 sentence description, "Read →" link.
- **FR-015**: Individual essay pages MUST include: full rendered body, title, author, date, read time (words ÷ 200 rounded up), pillar tag, LinkedIn and X share icons, "Back to Thinking →" at top and bottom, and 2 related essays at the bottom.
- **FR-016**: Essay slugs MUST be immutable after first publish.
- **FR-017**: Draft essays MUST NOT appear on any public URL.

**About Page**
- **FR-018**: The page MUST contain four narrative prose sections: Lagos bus story, Failures First, Erasmus Years, What I'm Building Now — no timeline graphic or bullet points.
- **FR-019**: A quick-facts sidebar (desktop) / summary block (mobile) MUST show: Current city, Origin, Education, Companies.
- **FR-020**: A third-person Speaker Bio block MUST be present at the bottom, formatted for copy-paste by journalists.

**Contact Page**
- **FR-021**: Three distinct contact sections MUST exist at anchors `#investor`, `#founder`, and `#press` — all visible on a single page without tabs or accordions.
- **FR-022**: Each form MUST submit via Netlify Forms to a dedicated recipient. [NEEDS CLARIFICATION: exact email addresses — see Open Question #1 in PRD §13]
- **FR-023**: Successful form submission MUST display inline confirmation "We'll be in touch." — no page redirect.
- **FR-024**: Form failure MUST display an inline error message with a direct email fallback — never a silent failure.

**CMS**
- **FR-025**: Decap CMS MUST be installed at `/admin` with GitHub OAuth authentication.
- **FR-026**: The Essay content type MUST include all fields from PRD §7.2 (title, slug, publish_date, status, pillar, description ≤ 160 chars, body, related_essays, fr_title, fr_description, fr_body).
- **FR-027**: The Company content type MUST include two singleton records (Weyz, Avancier) with all text fields editable and FR variants.
- **FR-028**: Site Globals content type MUST include site_tagline, sub_tagline, about_bio_short, speaker_bio_pdf, and FR variants.

**Bilingual**
- **FR-029**: All five pages MUST have English and French equivalents at `/[page]` and `/fr/[page]`.
- **FR-030**: All pages MUST include `<link rel="alternate" hreflang="en">` and `<link rel="alternate" hreflang="fr">` in `<head>`.
- **FR-031**: French pages MUST have `<html lang="fr">`.

**SEO & Meta**
- **FR-032**: Every page MUST have `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image` (1200×630px static PNG).
- **FR-033**: Canonical tags MUST be present on all pages.
- **FR-034**: `robots.txt` MUST allow all paths except `/admin`.
- **FR-035**: `sitemap.xml` MUST include all published essay URLs and be auto-regenerated on build.
- **FR-036**: `/about` MUST include JSON-LD `Person` schema; each essay page MUST include JSON-LD `Article` schema.

**Performance**
- **FR-037**: All images MUST be WebP with JPG fallback, have explicit `width`/`height`, and be lazy-loaded below the fold.
- **FR-038**: Google Fonts MUST be loaded with a `<link rel="preconnect">` hint and `font-display: swap`.
- **FR-039**: No render-blocking scripts. All non-critical JS MUST be `defer`red.
- **FR-040**: Total critical-path page weight MUST NOT exceed 200 KB (uncompressed).

**Analytics**
- **FR-041**: Privacy-first analytics (Plausible or Fathom) MUST be installed and verified at launch. [NEEDS CLARIFICATION: budget preference — see PRD §14.B]

### Key Entities

- **Essay**: title, slug (immutable post-publish), publish_date, status (draft|published), pillar (enum/5 values), description (≤160 chars), body (Markdown), related_essays (array ≤2 slugs), fr_title, fr_description, fr_body.
- **Company**: company_name, one_liner, problem, product, current_stage, why_now, cta_text, cta_anchor — plus FR variants for all text fields. Two instances: Weyz, Avancier.
- **Site Globals**: site_tagline, site_sub_tagline, about_bio_short, speaker_bio_pdf — plus FR variants.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Site is live at josephomidiora.com with all five pages (EN + FR) within 14 days of approval — Day 0 is the day all Open Questions (§13 of PRD) are answered.
- **SC-002**: Lighthouse Performance score ≥ 90 on all pages (mobile, throttled 4G) at launch.
- **SC-003**: Lighthouse Accessibility score ≥ 95 on all pages at launch.
- **SC-004**: LCP ≤ 2.5 s, CLS < 0.1, INP ≤ 200 ms on home page (4G throttled, Lighthouse).
- **SC-005**: Zero axe-core accessibility violations on all pages at launch.
- **SC-006**: Avg session duration > 90 seconds by Day 30 post-launch (analytics).
- **SC-007**: Contact CTA clicks > 10 by Day 30 post-launch (analytics).
- **SC-008**: Essay page visits > 100 by Day 30 post-launch (analytics).
- **SC-009**: Site indexed by Google; josephomidiora.com appears for "Joseph Omidiora" query by Day 30.
- **SC-010**: Joseph successfully publishes a new essay via CMS without developer involvement within the first week post-launch.
- **SC-011**: French pages account for a measurable baseline of traffic by Day 30 (target: >10% by Day 90).

---

## Assumptions

- Joseph will supply all written content (English copy, essay body text, company stage descriptions) by Day 3 of the build.
- French translations will be provided by Joseph or a named translator by Day 9 of the build.
- A professional documentary-style photo of Joseph will be available by Day 3.
- The domain josephomidiora.com is registered and Joseph has DNS access. [OPEN QUESTION #7]
- A Netlify account exists or will be created before Day 1 of the build. [OPEN QUESTION #6]
- The first essay to be published has a finalised title and body before Day 4. [OPEN QUESTION #5]
- No server-side runtime is required; all functionality is achievable on static hosting with Netlify Forms.
- Decap CMS GitHub OAuth setup requires a GitHub OAuth App to be registered under Joseph's account.
- The build script (Node.js, MD → HTML) is a single-file utility with no framework dependency.
- No CAPTCHA is added at v1; spam management is deferred.
- No dark mode toggle is implemented at v1.
- No newsletter integration at v1.
