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

  label {
    font-family: var(--font-body, "DM Sans", sans-serif);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text, #2a2a2a);
  }

  input,
  textarea {
    font-family: var(--font-body, "DM Sans", sans-serif);
    font-size: 1rem;
    color: var(--color-text, #2a2a2a);
    background: #fff;
    border: 1px solid var(--color-border, #e0dad0);
    border-radius: var(--btn-radius, 2px);
    padding: 0.625rem 0.75rem;
    width: 100%;
    transition: border-color 120ms ease;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-signal, #00c853);
    box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.2);
  }

  button[type="submit"] {
    align-self: flex-start;
    font-family: var(--font-body, "DM Sans", sans-serif);
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.75rem 1.75rem;
    background: var(--color-signal, #00c853);
    color: var(--color-primary, #0d0d0d);
    border: none;
    border-radius: var(--btn-radius, 2px);
    cursor: pointer;
    transition: filter 120ms ease;
    min-height: 44px;
  }

  button[type="submit"]:hover { filter: brightness(0.9); }

  button[type="submit"]:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
  }

  [data-success],
  [data-error] { display: none; padding: var(--space-2, 1rem); border-radius: 2px; font-size: 0.9375rem; }
  [data-success] { background: #e8f5e9; color: #1b5e20; }
  [data-error] { background: #ffebee; color: #b71c1c; }
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
