/**
 * Build script — josephomidiora.com
 * Reads content/essays/*.md → outputs EN and FR HTML pages.
 * Also regenerates sitemap.xml and content/essays-manifest.json.
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
const BASE_URL = "https://josephomidiora.com";

/* ============================================================
   Public utility — exported for unit tests
   ============================================================ */

/** Returns ceiling of (wordCount / 200), minimum 1 */
export function calculateReadTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/* ============================================================
   Internal helpers
   ============================================================ */

function ensureDir(dir) {
  if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); }
}

function formatDate(iso) {
  if (!iso) { return ""; }
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

function renderEssayPage({ title, date, pillar, body, readTime, slug, lang = "en" }) {
  const langAttr = lang === "fr" ? "fr" : "en";
  const backHref = lang === "fr" ? "/fr/thinking.html" : "/thinking.html";
  const enPath = `/${slug}.html`;
  const frPath = `/fr/thinking/${slug}.html`;

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Joseph Omidiora</title>
  <meta name="description" content="${title}">
  <link rel="canonical" href="${BASE_URL}${lang === "fr" ? "/fr" : ""}/thinking/${slug}.html">
  <link rel="alternate" hreflang="en" href="${BASE_URL}${enPath}">
  <link rel="alternate" hreflang="fr" href="${BASE_URL}${frPath}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${lang === "fr" ? "../../" : "../"}css/tokens.css">
  <link rel="stylesheet" href="${lang === "fr" ? "../../" : "../"}css/base.css">
  <link rel="stylesheet" href="${lang === "fr" ? "../../" : "../"}css/components.css">
  <link rel="stylesheet" href="${lang === "fr" ? "../../" : "../"}css/pages.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title.replace(/"/g, '\\"')}",
    "author": { "@type": "Person", "name": "Joseph Omidiora" },
    "datePublished": "${date}",
    "publisher": { "@type": "Person", "name": "Joseph Omidiora", "url": "${BASE_URL}" }
  }
  </script>
</head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>

  <site-nav current-page="" lang="${langAttr}" en-path="${enPath}" fr-path="${frPath}"></site-nav>

  <main id="main" class="container">
    <a href="${backHref}" class="essay__back">← Back to Thinking</a>

    <article class="essay">
      <header class="essay__header">
        <span class="essay__pillar">${pillar}</span>
        <h1 class="essay__title">${title}</h1>
        <div class="essay__meta">
          <span>By Joseph Omidiora</span>
          <time datetime="${date}">${formatDate(date)}</time>
          <span>${readTime} min read</span>
        </div>
      </header>

      <div class="prose essay__body">
        ${body}
      </div>

      <footer class="essay__footer">
        <div class="essay__share">
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${BASE_URL}/thinking/${slug}.html"
             target="_blank" rel="noopener noreferrer"
             aria-label="Share on LinkedIn">
            LinkedIn
          </a>
          <a href="https://twitter.com/intent/tweet?url=${BASE_URL}/thinking/${slug}.html"
             target="_blank" rel="noopener noreferrer"
             aria-label="Share on X (Twitter)">
            X / Twitter
          </a>
        </div>
        <a href="${backHref}" class="essay__back">← Back to Thinking</a>
      </footer>
    </article>
  </main>

  <script type="module" src="${lang === "fr" ? "../../" : "../"}components/site-nav.js"></script>
  <script type="module">
    import { SiteNav } from '${lang === "fr" ? "../../" : "../"}components/site-nav.js';
    customElements.define('site-nav', SiteNav);
  </script>
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
    const enHtml = renderEssayPage({ title, date: publish_date, pillar, body, readTime, slug, lang: "en" });
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
      fr_title: fr_title ?? null,
      fr_description: fr_description ?? null,
      hasFrench: !!(fr_body && fr_body.trim().length > 0),
    });
  }

  /* Sort manifest reverse-chronological */
  manifest.sort((a, b) => new Date(b.date) - new Date(a.date));
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");

  /* Regenerate sitemap */
  const staticPages = [
    "",
    "/building.html",
    "/thinking.html",
    "/about.html",
    "/contact.html",
    "/fr/",
    "/fr/building.html",
    "/fr/thinking.html",
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
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  writeFileSync(SITEMAP_PATH, sitemap, "utf8");

  console.error(`[build] Done — ${manifest.length} essays, sitemap updated`);
}

/* Run when called directly (not imported by tests) */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { translateAllPages } = await import("./translate.js");
  build();
  await translateAllPages();
}
