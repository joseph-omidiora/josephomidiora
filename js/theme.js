/**
 * Theme controller — light / dark.
 *
 * The blocking half of this lives inline in each document <head> as a
 * two-line snippet that stamps the persisted choice onto <html> before
 * first paint. This module owns everything after that: persistence and
 * the toggle contract.
 *
 * Contract
 *   Listens for  document → "theme:toggle"   (fired by <site-nav>)
 *   Dispatches   document → "theme:changed"  { detail: { theme } }
 *
 * With no stored preference the site follows prefers-color-scheme;
 * an explicit choice is written to localStorage under "jo-theme" and
 * wins until cleared.
 */

const STORAGE_KEY = "jo-theme";

function systemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function currentTheme() {
  return document.documentElement.getAttribute("data-theme") ?? systemTheme();
}

export function setTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);

  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* Private browsing or blocked storage — the theme still applies
       for this page view, it just won't persist. */
  }

  document.dispatchEvent(new CustomEvent("theme:changed", { detail: { theme: next } }));
  return next;
}

export function toggleTheme() {
  return setTheme(currentTheme() === "dark" ? "light" : "dark");
}

export function initTheme() {
  /* Reflect the effective theme so components can read it as an
     attribute even when the visitor has never chosen one. */
  if (!document.documentElement.hasAttribute("data-theme")) {
    document.documentElement.setAttribute("data-theme", systemTheme());
  }

  document.addEventListener("theme:toggle", () => toggleTheme());

  /* Follow the OS while the visitor has expressed no preference. */
  let stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }

  if (!stored) {
    window.matchMedia?.("(prefers-color-scheme: dark)")
      .addEventListener?.("change", (e) => {
        document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
        document.dispatchEvent(
          new CustomEvent("theme:changed", { detail: { theme: e.matches ? "dark" : "light" } })
        );
      });
  }

  document.dispatchEvent(new CustomEvent("theme:changed", { detail: { theme: currentTheme() } }));
}

if (typeof document !== "undefined") {
  initTheme();
}
