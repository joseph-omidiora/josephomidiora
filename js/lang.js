/**
 * Language toggle — routes between EN and FR equivalent pages.
 * Called by site-nav and any standalone lang toggle on the page.
 *
 * Convention:
 *   EN:  /[page].html
 *   FR:  /fr/[page].html
 *
 * The current language and equivalent path are set as
 * data-lang and data-alt-href attributes on the <html> element
 * by the build script / each page's HTML.
 */

export function initLangToggle() {
  const html = document.documentElement;
  const lang = html.getAttribute("lang") ?? "en";
  const altHref = html.getAttribute("data-alt-href");

  if (!altHref) { return; }

  document.querySelectorAll("[data-lang-switch]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = altHref;
    });
  });

  /* Update any site-nav components with current lang and paths */
  document.querySelectorAll("site-nav").forEach((nav) => {
    nav.setAttribute("lang", lang);
    if (lang === "en") {
      nav.setAttribute("en-path", window.location.pathname);
      nav.setAttribute("fr-path", altHref);
    } else {
      nav.setAttribute("fr-path", window.location.pathname);
      nav.setAttribute("en-path", altHref);
    }
  });
}

/* Auto-init on DOMContentLoaded */
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLangToggle);
  } else {
    initLangToggle();
  }
}
