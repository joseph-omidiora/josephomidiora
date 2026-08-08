/**
 * <newsletter-form> — single-field email capture for the dispatch list.
 *
 * Purpose
 *   One input, one button, one job: collect an email address for the
 *   infrastructure dispatch. Posts to Netlify Forms like <contact-form>,
 *   but kept separate because its layout, validation and success copy
 *   share nothing with the enquiry forms.
 *
 * Public API
 *   Attributes:
 *     form-name     — Netlify form name. Default "newsletter".
 *     submit-label  — button text. Default "Subscribe".
 *   Events: none.
 *
 * Usage
 *   <newsletter-form submit-label="Subscribe"></newsletter-form>
 *
 * Offline / degraded-network behaviour
 *   A failed POST renders an inline, assertive error pointing the
 *   visitor at the direct email address rather than silently failing.
 *
 * Known limitations
 *   Validation is the browser's native email type check only; no
 *   MX or disposable-domain checking is performed client-side.
 */

const STYLES = `
  :host { display: block; }

  form {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .field { flex: 1 1 16rem; display: flex; flex-direction: column; gap: 0.375rem; }

  label {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--text-caption, 0.8125rem);
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-muted, #6d6a63);
  }

  input {
    width: 100%;
    box-sizing: border-box;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--text-mono-body, 0.9375rem);
    color: var(--color-text, #23262b);
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #ded6c9);
    border-radius: var(--btn-radius, 2px);
    padding: 0.625rem 0.75rem;
    min-height: 44px;
    transition: border-color 120ms ease;
  }

  input:focus {
    outline: none;
    border-color: var(--color-signal, #00c853);
    box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
  }

  button {
    align-self: flex-end;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--btn-font-size, 0.8125rem);
    font-weight: 600;
    letter-spacing: -0.01em;
    padding: 0.6875rem 1.5rem;
    min-height: 44px;
    background: var(--color-signal, #00c853);
    color: var(--color-cta-text, #0d0d0d);
    border: 1.5px solid var(--color-signal, #00c853);
    border-radius: var(--btn-radius, 2px);
    cursor: pointer;
    transition: filter 120ms ease;
  }

  button:hover { filter: brightness(0.92); }

  button:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
  }

  [data-success],
  [data-error] {
    display: none;
    flex-basis: 100%;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--text-caption, 0.8125rem);
    padding: var(--space-2, 1rem);
    border-radius: 2px;
    border-left: 2px solid currentcolor;
    margin: 0;
  }

  [data-success] { background: rgb(0 200 83 / 10%); color: #06703a; }
  [data-error] { background: rgb(183 28 28 / 10%); color: #b3261e; }
  [data-success].visible,
  [data-error].visible { display: block; }
`;

const FALLBACK_EMAIL = "joseph@weyz.app";

export class NewsletterForm extends HTMLElement {
  static get observedAttributes() {
    return ["form-name", "submit-label"];
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this._render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) { this._render(); }
  }

  _render() {
    const formName = this.getAttribute("form-name") ?? "newsletter";
    const submitLabel = this.getAttribute("submit-label") ?? "Subscribe";

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <form novalidate data-netlify="true" name="${formName}">
        <input type="hidden" name="form-name" value="${formName}">
        <div class="field">
          <label for="newsletter-email">Email</label>
          <input id="newsletter-email" name="email" type="email" required
                 autocomplete="email" placeholder="you@example.com">
        </div>
        <button type="submit">${submitLabel}</button>
        <p data-success role="status" aria-live="polite">Subscribed. First dispatch lands in your inbox.</p>
        <p data-error role="alert" aria-live="assertive"></p>
      </form>
    `;

    this.shadowRoot.querySelector("form").addEventListener("submit", (e) => this._handleSubmit(e));
  }

  async _handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const root = this.shadowRoot;
    const success = root.querySelector("[data-success]");
    const error = root.querySelector("[data-error]");
    const input = root.querySelector("#newsletter-email");

    success.classList.remove("visible");
    error.classList.remove("visible");

    if (!input.value || !input.checkValidity()) {
      error.textContent = "Enter a valid email address.";
      error.classList.add("visible");
      input.focus();
      return;
    }

    try {
      const data = new URLSearchParams(new FormData(form));
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      });
      success.classList.add("visible");
      form.reset();
    } catch {
      error.textContent = `Subscription failed. Email ${FALLBACK_EMAIL} and I'll add you manually.`;
      error.classList.add("visible");
    }
  }
}
