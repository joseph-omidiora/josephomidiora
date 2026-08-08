/**
 * <contact-form> — a Netlify-backed enquiry form.
 *
 * Purpose
 *   Renders one of the site's three enquiry routes (investor, founder,
 *   press) from a declarative field list, and submits it to Netlify
 *   Forms without a page navigation.
 *
 * Public API
 *   Attributes:
 *     form-name     — Netlify form name; also selects the fallback
 *                     email shown if submission fails. Required.
 *     fields        — JSON array of field keys drawn from FIELD_DEFAULTS.
 *                     Default ["name","email","message"].
 *     submit-label  — submit button text. Default "Send".
 *   Events: none.
 *
 * Usage
 *   <contact-form form-name="investor-enquiry"
 *                 fields='["name","email","message"]'
 *                 submit-label="Send enquiry"></contact-form>
 *
 * Offline / degraded-network behaviour
 *   A failed POST is caught and replaced with an inline, assertive
 *   error naming the direct email address for that route, so the user
 *   always has a way to reach a human.
 *
 * Known limitations
 *   Relies on Netlify's build-time form detection; the form markup
 *   lives in Shadow DOM, so each form name must also be registered in
 *   Netlify's UI or via a static form stub.
 */

/* Field config: id, label, type, required, optional */
const FIELD_DEFAULTS = {
  name: { label: "Name", type: "text", required: true },
  organisation: { label: "Organisation", type: "text", required: true },
  role: { label: "Role", type: "text", required: true },
  company: { label: "Company (optional)", type: "text", required: false },
  email: { label: "Email", type: "email", required: true },
  message: { label: "Message", type: "textarea", required: true },
  "what-you-are-building": { label: "What you're building", type: "textarea", required: true },
  publication: { label: "Publication / Outlet", type: "text", required: true },
  "nature-of-enquiry": { label: "Nature of enquiry", type: "textarea", required: true },
};

function buildField(name) {
  const config = FIELD_DEFAULTS[name] ?? { label: name, type: "text", required: true };
  const id = `field-${name}`;
  const requiredAttr = config.required ? "required" : "";
  const requiredMark = config.required ? '<span aria-hidden="true"> *</span>' : "";

  if (config.type === "textarea") {
    return `
      <div class="field">
        <label for="${id}">${config.label}${requiredMark}</label>
        <textarea id="${id}" name="${name}" ${requiredAttr} rows="4"></textarea>
      </div>`;
  }

  return `
    <div class="field">
      <label for="${id}">${config.label}${requiredMark}</label>
      <input id="${id}" name="${name}" type="${config.type}" ${requiredAttr}>
    </div>`;
}

const STYLES = `
  :host { display: block; }

  form { display: flex; flex-direction: column; gap: var(--space-3, 1.5rem); }

  .field { display: flex; flex-direction: column; gap: 0.375rem; }

  /* Field labels read as config keys: uppercase, tracked-out mono. */
  label {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--text-caption, 0.8125rem);
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-muted, #6d6a63);
  }

  input,
  textarea {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--text-mono-body, 0.9375rem);
    color: var(--color-text, #23262b);
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #ded6c9);
    border-radius: var(--btn-radius, 2px);
    padding: 0.625rem 0.75rem;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 120ms ease;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-signal, #00c853);
    box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
  }

  button[type="submit"] {
    align-self: flex-start;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--btn-font-size, 0.8125rem);
    font-weight: 600;
    letter-spacing: -0.01em;
    padding: 0.6875rem 1.5rem;
    background: var(--color-signal, #00c853);
    color: var(--color-cta-text, #0d0d0d);
    border: 1.5px solid var(--color-signal, #00c853);
    border-radius: var(--btn-radius, 2px);
    cursor: pointer;
    transition: filter 120ms ease;
    min-height: 44px;
  }

  button[type="submit"]:hover { filter: brightness(0.92); }

  button[type="submit"]:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
  }

  [data-success],
  [data-error] {
    display: none;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--text-caption, 0.8125rem);
    padding: var(--space-2, 1rem);
    border-radius: 2px;
    border-left: 2px solid currentcolor;
  }

  [data-success] { background: rgb(0 200 83 / 10%); color: #06703a; }
  [data-error] { background: rgb(183 28 28 / 10%); color: #b3261e; }
  [data-success].visible,
  [data-error].visible { display: block; }
`;

export class ContactForm extends HTMLElement {
  static get observedAttributes() {
    return ["form-name", "fields", "submit-label"];
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this._render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) { this._render(); }
  }

  _render() {
    const root = this.shadowRoot;
    const formName = this.getAttribute("form-name") ?? "contact";
    const rawFields = this.getAttribute("fields");
    const fields = rawFields ? JSON.parse(rawFields) : ["name", "email", "message"];
    const submitLabel = this.getAttribute("submit-label") ?? "Send";

    root.innerHTML = `
      <style>${STYLES}</style>
      <form novalidate data-netlify="true" name="${formName}">
        <input type="hidden" name="form-name" value="${formName}">
        ${fields.map(buildField).join("")}
        <button type="submit">${submitLabel}</button>
        <p data-success role="status" aria-live="polite">We'll be in touch.</p>
        <p data-error role="alert" aria-live="assertive"></p>
      </form>
    `;

    root.querySelector("form").addEventListener("submit", (e) => this._handleSubmit(e));
  }

  async _handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const root = this.shadowRoot;
    const success = root.querySelector("[data-success]");
    const error = root.querySelector("[data-error]");

    success.classList.remove("visible");
    error.classList.remove("visible");

    const FALLBACK_EMAILS = {
      "investor-enquiry": "joseph@weyz.app",
      "press-enquiry": "joseph@weyz.app",
      "founder-enquiry": "josephomidiora@gmail.com",
    };

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
      const fallback = FALLBACK_EMAILS[this.getAttribute("form-name") ?? ""] ?? "joseph@weyz.app";
      error.textContent = `Submission failed. Please email ${fallback} directly.`;
      error.classList.add("visible");
    }
  }
}
