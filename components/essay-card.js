const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; }

    .card {
      background: var(--card-bg, #fff);
      border: var(--card-border, 1px solid #e0dad0);
      border-radius: var(--card-radius, 2px);
      padding: var(--card-padding, 1.5rem);
    }

    [data-pillar] {
      display: inline-block;
      font-family: var(--font-body, "DM Sans", sans-serif);
      font-size: var(--text-tag, 0.75rem);
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-signal, #00c853);
      margin-bottom: 0.625rem;
    }

    [data-title] {
      font-family: var(--font-display, "Playfair Display", serif);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-primary, #0d0d0d);
      line-height: 1.3;
      margin-bottom: 0.5rem;
    }

    [data-description] {
      font-family: var(--font-body, "DM Sans", sans-serif);
      font-size: 0.9375rem;
      color: var(--color-mid, #555);
      line-height: 1.6;
      margin-bottom: 0.75rem;
    }

    .card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.75rem;
    }

    [data-date] {
      font-family: var(--font-body, "DM Sans", sans-serif);
      font-size: var(--text-caption, 0.8125rem);
      color: var(--color-muted, #888);
    }

    a[data-read-link] {
      font-family: var(--font-body, "DM Sans", sans-serif);
      font-size: var(--text-nav, 0.875rem);
      font-weight: 600;
      color: var(--color-signal, #00c853);
      text-decoration: none;
    }

    a[data-read-link]:hover {
      text-decoration: underline;
    }
  </style>

  <article class="card">
    <span data-pillar></span>
    <p data-title></p>
    <p data-description></p>
    <div class="card__footer">
      <time data-date></time>
      <a data-read-link href="#">Read →</a>
    </div>
  </article>
`;

export class EssayCard extends HTMLElement {
  static get observedAttributes() {
    return ["title", "slug", "date", "pillar", "description"];
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
    const title = this.getAttribute("title") ?? "";
    const slug = this.getAttribute("slug") ?? "";
    const date = this.getAttribute("date") ?? "";
    const pillar = this.getAttribute("pillar") ?? "";
    const description = this.getAttribute("description") ?? "";

    root.querySelector("[data-pillar]").textContent = pillar;
    root.querySelector("[data-title]").textContent = title;
    root.querySelector("[data-description]").textContent = description;

    const timeEl = root.querySelector("[data-date]");
    timeEl.setAttribute("datetime", date);
    timeEl.textContent = date
      ? new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date))
      : "";

    const link = root.querySelector("[data-read-link]");
    link.setAttribute("href", `/thinking/${slug}.html`);
    link.setAttribute("aria-label", `Read: ${title}`);
  }
}
