const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: inline-block; }

    a {
      display: inline-flex;
      align-items: center;
      gap: 0.4em;
      font-family: var(--font-body, "DM Sans", sans-serif);
      font-size: var(--btn-font-size, 0.875rem);
      font-weight: var(--btn-font-weight, 600);
      line-height: 1;
      padding: var(--btn-padding, 0.75rem 1.75rem);
      border-radius: var(--btn-radius, 2px);
      text-decoration: none;
      cursor: pointer;
      transition: filter var(--transition-fast, 120ms ease);
      background: var(--color-signal, #00c853);
      color: var(--color-primary, #0d0d0d);
      border: var(--btn-border-width, 1.5px) solid var(--color-signal, #00c853);
    }

    a.cta--secondary {
      background: transparent;
      color: var(--color-signal, #00c853);
    }

    a:hover {
      filter: brightness(0.9);
      text-decoration: none;
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
  }
}
