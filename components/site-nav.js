/**
 * <site-nav> — the site's primary navigation bar.
 *
 * Purpose
 *   Sticky top navigation with a monospace wordmark, primary links,
 *   an EN/FR language toggle, a theme toggle, and a full-screen
 *   mobile overlay menu.
 *
 * Public API
 *   Attributes:
 *     current-page  — pathname of the active page; the matching link
 *                     receives aria-current="page". Default "/".
 *     lang          — "en" | "fr". Marks the active language. Default "en".
 *     en-path       — href for the English equivalent of this page.
 *     fr-path       — href for the French equivalent of this page.
 *   Events: none. Theme changes are dispatched by js/theme.js.
 *
 * Usage
 *   <site-nav current-page="/about.html" lang="en"
 *             en-path="/about.html" fr-path="/fr/about.html"></site-nav>
 *
 * Offline / degraded-network behaviour
 *   The component renders entirely from a static template with no
 *   network dependency, so it is fully functional offline. If the
 *   custom element never upgrades (JS disabled), the document still
 *   exposes every destination through the site footer's link lists.
 *
 * Known limitations
 *   Focus is not trapped inside the mobile overlay; Escape and the
 *   close button both dismiss it.
 */

const NAV_LINKS = [
  { href: "/", label: "home" },
  { href: "/building.html", label: "building" },
  { href: "/thinking.html", label: "thinking" },
  { href: "/now.html", label: "now" },
  { href: "/uses.html", label: "uses" },
  { href: "/about.html", label: "about" },
  { href: "/contact.html", label: "contact" },
];

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; }

    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3, 1.5rem);
      height: var(--nav-height, 3.5rem);
      padding-inline: var(--space-3, 1.5rem);
      background: var(--brand-obsidian, #0d0d0d);
      border-bottom: 1px solid #1e2224;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav__logo {
      display: inline-flex;
      align-items: baseline;
      gap: 0.35em;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #fff;
      text-decoration: none;
      flex-shrink: 0;
    }

    .nav__logo .sigil { color: var(--brand-signal, #00c853); }

    .nav__links {
      display: flex;
      gap: var(--space-3, 1.5rem);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav__links a {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: var(--text-nav, 0.8125rem);
      color: #b9c1c5;
      text-decoration: none;
      padding-bottom: 2px;
      border-bottom: 1px solid transparent;
      transition: color 120ms ease, border-color 120ms ease;
    }

    .nav__links a::before {
      content: "/";
      color: #4c565a;
    }

    .nav__links a:hover {
      color: #fff;
      border-bottom-color: var(--brand-signal, #00c853);
    }

    .nav__links a[aria-current="page"] {
      color: #fff;
      border-bottom-color: var(--brand-signal, #00c853);
    }

    .nav__links a[aria-current="page"]::before {
      color: var(--brand-signal, #00c853);
    }

    .nav__right {
      display: flex;
      align-items: center;
      gap: var(--space-2, 1rem);
      flex-shrink: 0;
    }

    [data-lang-toggle] {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: var(--text-nav, 0.8125rem);
      color: #4c565a;
      display: flex;
      gap: 0.3rem;
      align-items: center;
    }

    [data-lang-toggle] a {
      color: #b9c1c5;
      text-decoration: none;
    }

    [data-lang-toggle] a:hover { color: #fff; }

    [data-lang-toggle] [aria-current="true"] {
      color: var(--brand-signal, #00c853);
      font-weight: 600;
    }

    .nav__icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: 1px solid transparent;
      border-radius: 2px;
      cursor: pointer;
      padding: 0.375rem;
      color: #b9c1c5;
      transition: color 120ms ease, border-color 120ms ease;
    }

    .nav__icon-btn:hover {
      color: #fff;
      border-color: #2c3336;
    }

    .nav__icon-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
    }

    .nav__icon-btn svg {
      display: block;
      width: 18px;
      height: 18px;
    }

    .nav__hamburger { display: none; }

    .nav__hamburger svg { width: 22px; height: 22px; }

    /* Theme toggle shows the icon for the theme you would switch TO.
       The host mirrors <html data-theme> because :host-context() is not
       supported in Firefox. */
    .icon-sun { display: none; }
    :host([data-theme="dark"]) .icon-sun { display: block; }
    :host([data-theme="dark"]) .icon-moon { display: none; }

    /* Mobile overlay */
    #mobile-menu {
      display: none;
      position: fixed;
      inset: 0;
      background: var(--brand-obsidian, #0d0d0d);
      z-index: 200;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-6, 3rem);
    }

    #mobile-menu[aria-hidden="false"] { display: flex; }

    .mobile-menu__links {
      list-style: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3, 1.5rem);
      margin: 0;
      padding: 0;
    }

    .mobile-menu__links a {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #fff;
      text-decoration: none;
    }

    .mobile-menu__links a::before {
      content: "/";
      color: #4c565a;
    }

    .mobile-menu__links a[aria-current="page"],
    .mobile-menu__links a:hover {
      color: var(--brand-signal, #00c853);
    }

    .mobile-menu__close {
      position: absolute;
      top: var(--space-3, 1.5rem);
      inset-inline-end: var(--space-3, 1.5rem);
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: var(--space-1, 0.5rem);
    }

    @media (max-width: 62rem) {
      .nav__links { display: none; }
      .nav__hamburger { display: inline-flex; }
    }
  </style>

  <nav role="navigation" aria-label="Main navigation">
    <a href="/" class="nav__logo" aria-label="Joseph Omidiora — home">
      <span class="sigil" aria-hidden="true">$</span>joseph_omidiora
    </a>

    <ul class="nav__links">
      ${NAV_LINKS.map(
        ({ href, label }) => `<li><a href="${href}">${label}</a></li>`
      ).join("")}
    </ul>

    <div class="nav__right">
      <span data-lang-toggle aria-label="Language">
        <a data-en-link href="/">EN</a>
        <span aria-hidden="true">|</span>
        <a data-fr-link href="/fr/">FR</a>
      </span>

      <button
        class="nav__icon-btn"
        data-theme-toggle
        type="button"
        aria-label="Switch to dark theme"
      >
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
      </button>

      <button
        class="nav__icon-btn nav__hamburger"
        type="button"
        aria-label="Open navigation menu"
        aria-expanded="false"
        aria-controls="mobile-menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>
  </nav>

  <!-- Mobile overlay -->
  <div id="mobile-menu" aria-hidden="true" role="dialog" aria-label="Navigation menu" aria-modal="true">
    <button class="mobile-menu__close" aria-label="Close navigation menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="28" height="28">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <ul class="mobile-menu__links">
      ${NAV_LINKS.map(
        ({ href, label }) => `<li><a href="${href}">${label}</a></li>`
      ).join("")}
    </ul>

    <span data-lang-toggle aria-label="Language">
      <a data-en-link href="/">EN</a>
      <span aria-hidden="true">|</span>
      <a data-fr-link href="/fr/">FR</a>
    </span>
  </div>
`;

export class SiteNav extends HTMLElement {
  static get observedAttributes() {
    return ["current-page", "lang", "en-path", "fr-path"];
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._applyCurrentPage();
    this._applyLanguage();
    this._applyThemeLabel();
    this._bindEvents();
  }

  attributeChangedCallback() {
    if (!this.shadowRoot) { return; }
    this._applyCurrentPage();
    this._applyLanguage();
  }

  _applyCurrentPage() {
    const current = this.getAttribute("current-page") ?? "/";
    this.shadowRoot.querySelectorAll("nav a[href], #mobile-menu a[href]").forEach((a) => {
      if (a.getAttribute("href") === current && !a.hasAttribute("data-en-link") && !a.hasAttribute("data-fr-link")) {
        a.setAttribute("aria-current", "page");
      } else if (!a.hasAttribute("data-en-link") && !a.hasAttribute("data-fr-link")) {
        a.removeAttribute("aria-current");
      }
    });
  }

  _applyLanguage() {
    const lang = this.getAttribute("lang") ?? "en";
    const enPath = this.getAttribute("en-path") ?? "/";
    const frPath = this.getAttribute("fr-path") ?? "/fr/";

    this.shadowRoot.querySelectorAll("[data-en-link]").forEach((a) => {
      a.setAttribute("href", enPath);
      a.setAttribute("aria-current", lang === "en" ? "true" : "false");
    });
    this.shadowRoot.querySelectorAll("[data-fr-link]").forEach((a) => {
      a.setAttribute("href", frPath);
      a.setAttribute("aria-current", lang === "fr" ? "true" : "false");
    });
  }

  /* Mirrors the document theme onto the host (for icon state) and keeps the
     toggle's accessible name describing the destination theme. */
  _applyThemeLabel() {
    const btn = this.shadowRoot.querySelector("[data-theme-toggle]");
    if (!btn) { return; }
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    this.setAttribute("data-theme", isDark ? "dark" : "light");
    btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }

  _bindEvents() {
    const hamburger = this.shadowRoot.querySelector("[aria-controls='mobile-menu']");
    const menu = this.shadowRoot.querySelector("#mobile-menu");
    const closeBtn = this.shadowRoot.querySelector(".mobile-menu__close");
    const themeBtn = this.shadowRoot.querySelector("[data-theme-toggle]");

    hamburger?.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      if (expanded) { this._closeMenu(); } else { this._openMenu(); }
    });
    closeBtn?.addEventListener("click", () => this._closeMenu());

    themeBtn?.addEventListener("click", () => {
      /* js/theme.js owns persistence; the nav only requests the flip. */
      document.dispatchEvent(new CustomEvent("theme:toggle"));
    });

    document.addEventListener("theme:changed", () => this._applyThemeLabel());

    menu?.addEventListener("click", (e) => {
      if (e.target.tagName === "A") { this._closeMenu(); }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { this._closeMenu(); }
    });
  }

  _openMenu() {
    const hamburger = this.shadowRoot.querySelector("[aria-controls='mobile-menu']");
    const menu = this.shadowRoot.querySelector("#mobile-menu");
    hamburger?.setAttribute("aria-expanded", "true");
    hamburger?.setAttribute("aria-label", "Close navigation menu");
    menu?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  _closeMenu() {
    const hamburger = this.shadowRoot.querySelector("[aria-controls='mobile-menu']");
    const menu = this.shadowRoot.querySelector("#mobile-menu");
    hamburger?.setAttribute("aria-expanded", "false");
    hamburger?.setAttribute("aria-label", "Open navigation menu");
    menu?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}
