/**
 * Build script — josephomidiora.com
 * Reads content/essays/*.md → outputs EN and FR HTML pages.
 * Also regenerates sitemap.xml, feed.xml and content/essays-manifest.json.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ESSAYS_DIR = join(ROOT, "content", "essays");
const THINKING_DIR = join(ROOT, "thinking");
const FR_THINKING_DIR = join(ROOT, "fr", "thinking");
const MANIFEST_PATH = join(ROOT, "content", "essays-manifest.json");
const SITEMAP_PATH = join(ROOT, "sitemap.xml");
const FEED_PATH = join(ROOT, "feed.xml");
const BASE_URL = "https://josephomidiora.com";
const AUTHOR = "Joseph Omidiora";
const AUTHOR_EMAIL = "joseph@weyz.app";

/* Shared <head> fragments so every generated page matches the hand-written
   pages exactly. Font families are declared once, here and in the HTML pages. */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=JetBrains+Mono:wght@400;500;700&display=swap";

const THEME_BOOTSTRAP = `<script>
    try {
      var t = localStorage.getItem("jo-theme");
      document.documentElement.setAttribute(
        "data-theme",
        t || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      );
    } catch (e) { /* storage blocked — fall back to the media query in CSS */ }
  </script>`;

/* ============================================================
   Public utilities — exported for unit tests
   ============================================================ */

/** Returns ceiling of (wordCount / 200), minimum 1 */
export function calculateReadTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Escapes the five XML metacharacters. Used for every value interpolated
 *  into sitemap.xml and feed.xml. */
export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Escapes text destined for an HTML attribute value. */
export function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Builds an RSS 2.0 document from manifest entries. Exported so the feed
 *  shape can be asserted without touching the filesystem. */
export function renderFeed(entries, { baseUrl = BASE_URL, now = new Date() } = {}) {
  const items = entries
    .map((e) => {
      const url = `${baseUrl}/thinking/${e.slug}.html`;
      return `    <item>
      <title>${escapeXml(e.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(e.date).toUTCString()}</pubDate>
      <category>${escapeXml(e.pillar)}</category>
      <dc:creator>${escapeXml(AUTHOR)}</dc:creator>
      <description>${escapeXml(e.description ?? "")}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Joseph Omidiora — Thinking</title>
    <link>${escapeXml(baseUrl)}/thinking.html</link>
    <atom:link href="${escapeXml(baseUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Essays on infrastructure, Africa, and building.</description>
    <language>en</language>
    <managingEditor>${escapeXml(AUTHOR_EMAIL)} (${escapeXml(AUTHOR)})</managingEditor>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

/* ============================================================
   Internal helpers
   ============================================================ */

function ensureDir(dir) {
  if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); }
}

function formatDate(iso, lang = "en") {
  if (!iso) { return ""; }
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

function renderFooter(prefix) {
  return `  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__grid">
        <div>
          <h2>${AUTHOR}</h2>
          <p class="site-footer__blurb">
            Data engineer and founder, building digital infrastructure
            that solves African challenges.
          </p>
        </div>
        <div>
          <h2>Site</h2>
          <ul>
            <li><a href="${prefix}index.html">Home</a></li>
            <li><a href="${prefix}building.html">Building</a></li>
            <li><a href="${prefix}thinking.html">Thinking</a></li>
            <li><a href="${prefix}now.html">Now</a></li>
            <li><a href="${prefix}uses.html">Uses</a></li>
            <li><a href="${prefix}about.html">About</a></li>
            <li><a href="${prefix}contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h2>Elsewhere</h2>
          <ul>
            <li><a href="https://www.linkedin.com/in/josephomidiora" rel="me noopener" target="_blank">LinkedIn</a></li>
            <li><a href="https://twitter.com/josephomidiora" rel="me noopener" target="_blank">X / Twitter</a></li>
            <li><a href="mailto:${AUTHOR_EMAIL}">${AUTHOR_EMAIL}</a></li>
            <li><a href="/feed.xml">RSS</a></li>
          </ul>
        </div>
      </div>

      <!-- Easter egg. Lazy-loaded by js/easter-egg.js once the footer
           nears the viewport, so it never touches the critical path. -->
      <pixel-tetris></pixel-tetris>

      <div class="site-footer__base">
        <p>© 2026 ${AUTHOR}</p>
        <p>Built without a framework. 0 KB of JavaScript you didn't ask for.</p>
      </div>
    </div>
  </footer>`;
}

function renderEssayPage({ title, date, pillar, body, readTime, slug, description = "", lang = "en" }) {
  const isFr = lang === "fr";
  const langAttr = isFr ? "fr" : "en";
  /* Depth from the generated file back to the site root */
  const prefix = isFr ? "../../" : "../";
  const backHref = isFr ? "/fr/thinking.html" : "/thinking.html";
  const enPath = `/thinking/${slug}.html`;
  const frPath = `/fr/thinking/${slug}.html`;
  const canonical = `${BASE_URL}${isFr ? frPath : enPath}`;
  const shareUrl = `${BASE_URL}${enPath}`;
  const metaDescription = description || title;

  return `<!DOCTYPE html>
<html lang="${langAttr}" data-alt-href="${isFr ? enPath : frPath}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeAttr(title)} — ${AUTHOR}</title>
  <meta name="description" content="${escapeAttr(metaDescription)}">
  <meta name="theme-color" content="#0d0d0d">

  ${THEME_BOOTSTRAP}

  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(metaDescription)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${BASE_URL}${enPath}">
  <link rel="alternate" hreflang="fr" href="${BASE_URL}${frPath}">
  <link rel="alternate" type="application/rss+xml" title="Joseph Omidiora — Thinking" href="/feed.xml">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${FONTS_HREF}">

  <link rel="stylesheet" href="${prefix}css/tokens.css">
  <link rel="stylesheet" href="${prefix}css/base.css">
  <link rel="stylesheet" href="${prefix}css/components.css">
  <link rel="stylesheet" href="${prefix}css/pages.css">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(title)},
    "description": ${JSON.stringify(metaDescription)},
    "author": { "@type": "Person", "name": "${AUTHOR}" },
    "datePublished": "${date}",
    "inLanguage": "${langAttr}",
    "publisher": { "@type": "Person", "name": "${AUTHOR}", "url": "${BASE_URL}" }
  }
  </script>
</head>
<body class="page--essay">
  <a href="#main" class="skip-link">Skip to content</a>

  <site-nav current-page="${isFr ? "/fr/thinking.html" : "/thinking.html"}" lang="${langAttr}" en-path="${enPath}" fr-path="${frPath}"></site-nav>

  <main id="main" class="container">
    <a href="${backHref}" class="essay__back">← ${isFr ? "Retour à Thinking" : "Back to Thinking"}</a>

    <article class="essay">
      <header class="essay__header">
        <span class="essay__pillar">${escapeAttr(pillar)}</span>
        <h1 class="essay__title">${escapeAttr(title)}</h1>
        <div class="essay__meta">
          <span>${AUTHOR}</span>
          <time datetime="${date}">${formatDate(date, langAttr)}</time>
          <span>${readTime} min read</span>
        </div>
      </header>

      <div class="prose essay__body">
        ${body}
      </div>

      <footer class="essay__footer">
        <div class="essay__share">
          <a class="essay__share-link"
             href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}"
             target="_blank" rel="noopener noreferrer"
             aria-label="Share on LinkedIn">
            share: LinkedIn
          </a>
          <a class="essay__share-link"
             href="https://twitter.com/intent/tweet?url=${shareUrl}"
             target="_blank" rel="noopener noreferrer"
             aria-label="Share on X (Twitter)">
            share: X
          </a>
          <a class="essay__share-link" href="/feed.xml">subscribe: RSS</a>
        </div>
        <a href="${backHref}" class="essay__back">← ${isFr ? "Retour à Thinking" : "Back to Thinking"}</a>
      </footer>
    </article>
  </main>

${renderFooter(prefix)}

  <script type="module">
    import { SiteNav } from '${prefix}components/site-nav.js';
    if (!customElements.get('site-nav')) customElements.define('site-nav', SiteNav);
  </script>
  <script type="module" src="${prefix}js/theme.js"></script>
  <script type="module" src="${prefix}js/lang.js"></script>
  <script type="module" src="${prefix}js/easter-egg.js"></script>
</body>
</html>`;
}

/* ============================================================
   Main build
   ============================================================ */

function build() {
  ensureDir(THINKING_DIR);
  ensureDir(FR_THINKING_DIR);

  const files = readdirSync(ESSAYS_DIR).filter((f) => f.endsWith(".md"));
  const manifest = [];
  const seenSlugs = new Set();

  for (const file of files) {
    const raw = readFileSync(join(ESSAYS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const { title, slug, publish_date, status, pillar, description, fr_title, fr_description, fr_body } = data;

    if (!slug) {
      console.error(`[build] Missing slug in ${file} — skipping`);
      continue;
    }

    if (seenSlugs.has(slug)) {
      console.error(`[build] Duplicate slug "${slug}" in ${file} — aborting to prevent overwrite`);
      process.exit(1);
    }
    seenSlugs.add(slug);

    if (status !== "published") { continue; }

    const body = marked.parse(content);
    const readTime = calculateReadTime(content);

    /* English page */
    const enHtml = renderEssayPage({
      title, date: publish_date, pillar, body, readTime, slug,
      description: description ?? "", lang: "en",
    });
    writeFileSync(join(THINKING_DIR, `${slug}.html`), enHtml, "utf8");

    /* French page — only if fr_body is populated */
    if (fr_body && fr_body.trim().length > 0) {
      const frBody = marked.parse(fr_body);
      const frReadTime = calculateReadTime(fr_body);
      const frHtml = renderEssayPage({
        title: fr_title ?? title,
        date: publish_date,
        pillar,
        body: frBody,
        readTime: frReadTime,
        slug,
        description: fr_description ?? description ?? "",
        lang: "fr",
      });
      writeFileSync(join(FR_THINKING_DIR, `${slug}.html`), frHtml, "utf8");
    }

    manifest.push({
      title,
      slug,
      date: publish_date,
      pillar,
      description: description ?? "",
      readTime,
      fr_title: fr_title ?? null,
      fr_description: fr_description ?? null,
      hasFrench: !!(fr_body && fr_body.trim().length > 0),
    });
  }

  /* Sort manifest reverse-chronological */
  manifest.sort((a, b) => new Date(b.date) - new Date(a.date));
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");

  /* RSS feed — most recent 20 essays */
  writeFileSync(FEED_PATH, renderFeed(manifest.slice(0, 20)), "utf8");

  /* Regenerate sitemap */
  const staticPages = [
    "/",
    "/building.html",
    "/thinking.html",
    "/now.html",
    "/uses.html",
    "/about.html",
    "/contact.html",
    "/fr/",
    "/fr/building.html",
    "/fr/thinking.html",
    "/fr/now.html",
    "/fr/uses.html",
    "/fr/about.html",
    "/fr/contact.html",
  ];

  const essayUrls = manifest.flatMap((e) => {
    const urls = [`/thinking/${e.slug}.html`];
    if (e.hasFrench) { urls.push(`/fr/thinking/${e.slug}.html`); }
    return urls;
  });

  const allUrls = [...staticPages, ...essayUrls];
  const today = new Date().toISOString().split("T")[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls
  .map(
    (path) => `  <url>
    <loc>${escapeXml(BASE_URL + path)}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  writeFileSync(SITEMAP_PATH, sitemap, "utf8");

  console.error(`[build] Done — ${manifest.length} essays, sitemap + feed updated`);
}

/* Run when called directly (not imported by tests) */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { translateAllPages } = await import("./translate.js");
  build();
  await translateAllPages();
}
