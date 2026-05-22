/**
 * translate.js — Build-time EN → FR translation using DeepL API
 *
 * Reads all EN static HTML pages, translates them to French via DeepL,
 * and writes the output to fr/*.html.
 *
 * Requires: DEEPL_API_KEY environment variable
 *   - Free tier:  https://www.deepl.com/pro-api (sign up → Free plan → API key ends in :fx)
 *   - Base URL:   https://api-free.deepl.com/v2/translate
 *
 * Proper nouns protected from translation:
 *   Joseph Omidiora, Weyz Mobility, Avancier Technologies,
 *   Erasmus Mundus, Federal University Akure, FUTA, Stockholm
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const DEEPL_KEY = process.env.DEEPL_API_KEY;
const DEEPL_URL = DEEPL_KEY?.endsWith(":fx")
  ? "https://api-free.deepl.com/v2/translate"
  : "https://api.deepl.com/v2/translate";

/* Pages to translate: [source, destination] */
const PAGES = [
  ["index.html",    "fr/index.html"],
  ["building.html", "fr/building.html"],
  ["thinking.html", "fr/thinking.html"],
  ["about.html",    "fr/about.html"],
  ["contact.html",  "fr/contact.html"],
];

/* Proper nouns that must never be translated */
const PROTECTED_TERMS = [
  "Joseph Omidiora",
  "Weyz Mobility",
  "Avancier Technologies",
  "Erasmus Mundus",
  "Federal University Akure",
  "FUTA",
  "Ile-Ife",
  "Stockholm",
  "Lagos",
  "Abuja",
  "Nigeria",
  "Nigerian",
  "DM Sans",
  "Playfair Display",
];

/* ── Placeholder protection ──────────────────────────────────────────────── */

function protectTerms(html) {
  let out = html;
  const map = {};
  PROTECTED_TERMS.forEach((term, i) => {
    const placeholder = `XTRMX${i}XENDX`;
    map[placeholder] = term;
    // Word-boundary safe replacement in text nodes (avoid replacing inside attrs)
    const re = new RegExp(`(?<=>|^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=<|\\s|$|[.,;:!?])`, "g");
    out = out.replace(re, (match) => match.replace(term, placeholder));
  });
  return { html: out, map };
}

function restoreTerms(html, map) {
  let out = html;
  for (const [placeholder, term] of Object.entries(map)) {
    out = out.split(placeholder).join(term);
  }
  return out;
}

/* ── Meta attribute extraction / re-injection ────────────────────────────── */

function extractMeta(html) {
  const extractions = [];

  // <meta name="description" content="...">
  html = html.replace(
    /(<meta\s+name="description"\s+content=")([^"]+)(")/gi,
    (_, pre, content, post) => {
      const id = `METADESC`;
      extractions.push({ id, content });
      return `${pre}${id}${post}`;
    }
  );

  // og:description
  html = html.replace(
    /(<meta\s+property="og:description"\s+content=")([^"]+)(")/gi,
    (_, pre, content, post) => {
      const id = `METAOGDESC`;
      extractions.push({ id, content });
      return `${pre}${id}${post}`;
    }
  );

  // og:title
  html = html.replace(
    /(<meta\s+property="og:title"\s+content=")([^"]+)(")/gi,
    (_, pre, content, post) => {
      const id = `METAOGTITLE`;
      extractions.push({ id, content });
      return `${pre}${id}${post}`;
    }
  );

  // <title>
  html = html.replace(/<title>([^<]+)<\/title>/gi, (_, content) => {
    extractions.push({ id: "PAGETITLE", content });
    return `<title>PAGETITLE</title>`;
  });

  return { html, extractions };
}

async function translateTexts(texts) {
  const res = await fetch(DEEPL_URL, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: texts,
      source_lang: "EN",
      target_lang: "FR",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.translations.map((t) => t.text);
}

async function reinjMeta(html, extractions) {
  if (extractions.length === 0) { return html; }
  const translated = await translateTexts(extractions.map((e) => e.content));
  let out = html;
  extractions.forEach(({ id }, i) => {
    out = out.split(id).join(translated[i]);
  });
  return out;
}

/* ── HTML structural fixes for FR pages ──────────────────────────────────── */

function frenchify(html, enPath, frPath) {
  return html
    // lang attribute
    .replace(/<html\s+lang="en"/, '<html lang="fr"')
    // data-alt-href: FR page points back to EN
    .replace(/data-alt-href="[^"]*"/, `data-alt-href="${enPath}"`)
    // canonical
    .replace(
      /<link rel="canonical" href="[^"]*">/,
      `<link rel="canonical" href="https://josephomidiora.com${frPath}">`
    )
    // site-nav lang
    .replace(/(<site-nav[^>]*)\slang="en"/, '$1 lang="fr"')
    // site-nav current-page — keep as-is (FR path)
    .replace(
      /(<site-nav[^>]*\s)en-path="([^"]*)"(\s*)fr-path="([^"]*)"/g,
      `$1en-path="$2"$3fr-path="${frPath}"`
    );
}

/* ── Main translation flow ───────────────────────────────────────────────── */

async function translatePage(srcPath, destPath) {
  const srcAbs = join(ROOT, srcPath);
  const destAbs = join(ROOT, destPath);

  if (!existsSync(srcAbs)) {
    console.error(`[translate] Source not found: ${srcPath}`);
    return;
  }

  const enPath = `/${srcPath}`;
  const frPath = `/${destPath}`;

  let html = readFileSync(srcAbs, "utf8");

  /* 1. Protect proper nouns */
  const { html: protected_, map } = protectTerms(html);
  html = protected_;

  /* 2. Extract meta attributes for separate translation */
  const { html: stripped, extractions } = extractMeta(html);
  html = stripped;

  /* 3. Translate full HTML (DeepL html mode preserves tags) */
  const res = await fetch(DEEPL_URL, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [html],
      source_lang: "EN",
      target_lang: "FR",
      tag_handling: "html",
      ignore_tags: ["script", "style", "code"],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL API error on ${srcPath} — ${res.status}: ${err}`);
  }

  const data = await res.json();
  html = data.translations[0].text;

  /* 4. Translate meta attributes */
  html = await reinjMeta(html, extractions);

  /* 5. Restore proper nouns */
  html = restoreTerms(html, map);

  /* 6. Fix structural attributes (lang, canonical, hreflang, nav paths) */
  html = frenchify(html, enPath, frPath);

  /* 7. Ensure fr/ directory exists */
  const destDir = dirname(destAbs);
  if (!existsSync(destDir)) { mkdirSync(destDir, { recursive: true }); }

  writeFileSync(destAbs, html, "utf8");
  console.error(`[translate] ✓ ${srcPath} → ${destPath}`);
}

export async function translateAllPages() {
  if (!DEEPL_KEY) {
    console.error(
      "[translate] DEEPL_API_KEY not set — skipping auto-translation.\n" +
      "            Set it in Netlify environment variables to enable FR pages."
    );
    return;
  }

  console.error("[translate] Starting EN → FR translation via DeepL...");

  for (const [src, dest] of PAGES) {
    try {
      await translatePage(src, dest);
    } catch (err) {
      console.error(`[translate] ✗ Failed ${src}: ${err.message}`);
    }
  }

  console.error("[translate] Done.");
}

/* Run standalone */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  translateAllPages();
}
