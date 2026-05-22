const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/building.html", label: "Building" },
  { href: "/thinking.html", label: "Thinking" },
  { href: "/about.html", label: "About" },
  { href: "/contact.html", label: "Contact" },
];

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; }

    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--nav-height, 4rem);
      padding-inline: var(--space-3, 1.5rem);
      background: var(--color-primary, #0d0d0d);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav__logo {
      font-family: var(--font-display, "Playfair Display", serif);
      font-size: 1.125rem;
      font-weight: 700;
      color: #fff;
      text-decoration: none;
    }

    .nav__links {
      display: flex;
      gap: var(--space-4, 2rem);
      list-style: none;
    }

    .nav__links a {
      font-family: var(--font-body, "DM Sans", sans-serif);
      font-size: var(--text-nav, 0.875rem);
      color: #fff;
      text-decoration: none;
      padding-bottom: 2px;
      border-bottom: 2px solid transparent;
      transition: border-color 120ms ease;
    }

    .nav__links a:hover,
    .nav__links a[aria-current="page"] {
      border-bottom-color: var(--color-signal, #00c853);
    }

    .nav__right {
      display: flex;
      align-items: center;
      gap: var(--space-3, 1.5rem);
    }

    [data-lang-toggle] {
      font-family: var(--font-body, "DM Sans", sans-serif);
      font-size: var(--text-nav, 0.875rem);
      color: #fff;
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }

    [data-lang-toggle] a {
      color: #fff;
      text-decoration: none;
    }

    [data-lang-toggle] [aria-current="true"] {
      color: var(--color-signal, #00c853);
      font-weight: 600;
    }

    .nav__hamburger {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--space-1, 0.5rem);
      color: #fff;
    }

    .nav__hamburger svg {
      display: block;
      width: 24px;
      height: 24px;
    }

    /* Mobile overlay */
    #mobile-menu {
      display: none;
      position: fixed;
      inset: 0;
      background: var(--color-primary, #0d0d0d);
      z-index: 200;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-6, 3rem);
    }

    #mobile-menu[aria-hidden="false"] {
      display: flex;
    }

    .mobile-menu__links {
      list-style: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4, 2rem);
    }

    .mobile-menu__links a {
      font-family: var(--font-display, "Playfair Display", serif);
      font-size: 2rem;
      color: #fff;
      text-decoration: none;
    }

    .mobile-menu__links a[aria-current="page"],
    .mobile-menu__links a:hover {
      color: var(--color-signal, #00c853);
    }

    .mobile-menu__close {
      position: absolute;
      top: var(--space-3, 1.5rem);
      right: var(--space-3, 1.5rem);
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: var(--space-1, 0.5rem);
    }

    @media (max-width: 48rem) {
      .nav__links { display: none; }
      .nav__hamburger { display: block; }
    }
  </style>

  <nav role="navigation" aria-label="Main navigation">
    <a href="/" class="nav__logo" aria-label="Joseph Omidiora — home">JO</a>

    <ul class="nav__links">
      ${NAV_LINKS.map(
        ({ href, label }) => `<li><a href="${href}">${label}</a></li>`
      ).join("")}
    </ul>

    <div class="nav__right">
      <span data-lang-toggle" aria-label="Language">
        <a data-en-link href="/">EN</a>
        <span aria-hidden="true"> | </span>
        <a data-fr-link href="/fr/">FR</a>
      </span>

      <button
        class="nav__hamburger"
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
      <span aria-hidden="true"> | </span>
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
    this._bindEvents();
  }

  attributeChangedCallback() {
    if (!this.shadowRoot) { return; }
    this._applyCurrentPage();
    this._applyLanguage();
  }

  _applyCurrentPage() {
    const current = this.getAttribute("current-page") ?? "/";
    this.shadowRoot.querySelectorAll("a[href]").forEach((a) => {
      if (a.getAttribute("href") === current) {
        a.setAttribute("aria-current", "page");
      } else {
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

  _bindEvents() {
    const hamburger = this.shadowRoot.querySelector("[aria-controls='mobile-menu']");
    const menu = this.shadowRoot.querySelector("#mobile-menu");
    const closeBtn = this.shadowRoot.querySelector(".mobile-menu__close");

    hamburger?.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      expanded ? this._closeMenu() : this._openMenu();
    });
    closeBtn?.addEventListener("click", () => this._closeMenu());

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
    menu?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  _closeMenu() {
    const hamburger = this.shadowRoot.querySelector("[aria-controls='mobile-menu']");
    const menu = this.shadowRoot.querySelector("#mobile-menu");
    hamburger?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}
