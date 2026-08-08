/**
 * <cta-button> — the site's call-to-action link, styled as a button.
 *
 * Purpose
 *   A single, consistent action affordance in the site's monospace
 *   register. Renders an <a>, not a <button>, because every use is
 *   navigation.
 *
 * Public API
 *   Attributes:
 *     label    — visible text and accessible name. Required.
 *     href     — destination. Default "#".
 *     variant  — "primary" (filled) | "secondary" (outline) |
 *                "ghost" (neutral outline). Default "primary".
 *     arrow    — boolean; appends " →" to the label.
 *   Events: none.
 *
 * Usage
 *   <cta-button label="Explore Weyz" href="/building.html" arrow></cta-button>
 *
 * Offline / degraded-network behaviour
 *   No network dependency. If the element never upgrades, nothing
 *   renders — so every cta-button on a page MUST be accompanied by,
 *   or duplicated in, a plain <a> elsewhere in the document (the
 *   footer link lists serve this purpose site-wide).
 *
 * Known limitations
 *   Does not support disabled state; a disabled navigation link
 *   should simply be omitted.
 */

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: inline-block; }

    a {
      display: inline-flex;
      align-items: center;
      gap: 0.5em;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: var(--btn-font-size, 0.8125rem);
      font-weight: var(--btn-font-weight, 600);
      letter-spacing: -0.01em;
      line-height: 1;
      padding: var(--btn-padding, 0.6875rem 1.5rem);
      border-radius: var(--btn-radius, 2px);
      text-decoration: none;
      cursor: pointer;
      transition: filter var(--transition-fast, 120ms ease), background var(--transition-fast, 120ms ease);
      background: var(--color-signal, #00c853);
      color: var(--color-cta-text, #0d0d0d);
      border: var(--btn-border-width, 1.5px) solid var(--color-signal, #00c853);
      min-height: 44px;
      box-sizing: border-box;
    }

    a.cta--secondary {
      background: transparent;
      color: var(--color-signal-ink, #06703a);
    }

    a.cta--ghost {
      background: transparent;
      border-color: var(--color-border-strong, #c4b9a6);
      color: var(--color-text, #23262b);
    }

    a:hover { filter: brightness(0.92); text-decoration: none; }

    a.cta--ghost:hover {
      filter: none;
      border-color: var(--color-signal, #00c853);
    }

    a:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
    }
  </style>

  <a href="#"><slot></slot></a>
`;

export class CtaButton extends HTMLElement {
  static get observedAttributes() {
    return ["label", "href", "variant", "arrow"];
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) { this._render(); }
  }

  _render() {
    const root = this.shadowRoot;
    const label = this.getAttribute("label") ?? "";
    const href = this.getAttribute("href") ?? "#";
    const variant = this.getAttribute("variant") ?? "primary";
    const arrow = this.hasAttribute("arrow");

    const link = root.querySelector("a");
    link.setAttribute("href", href);
    link.textContent = arrow ? `${label} →` : label;
    link.classList.toggle("cta--secondary", variant === "secondary");
    link.classList.toggle("cta--ghost", variant === "ghost");
  }
}
