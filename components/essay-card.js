/**
 * <essay-card> — a single essay preview in the Thinking index and
 * on the home page's latest-writing grid.
 *
 * Purpose
 *   Presents one essay: pillar, title, description, publication
 *   date and read time, linking to the generated essay page.
 *
 * Public API
 *   Attributes:
 *     title        — essay title. Required.
 *     slug         — filename stem; link resolves to /thinking/{slug}.html.
 *     date         — ISO 8601 publication date; formatted via Intl.
 *     pillar       — content pillar name, shown as the card's kicker.
 *     description  — one-paragraph summary.
 *     read-time    — integer minutes. Omitted from the UI if absent.
 *   Events: none.
 *
 * Usage
 *   <essay-card title="The Bus Is the Bank" slug="the-bus-is-the-bank"
 *               date="2026-05-01" pillar="Infrastructure Intelligence"
 *               description="…" read-time="6"></essay-card>
 *
 * Offline / degraded-network behaviour
 *   Renders purely from its attributes with no fetch of its own. The
 *   pages that populate it from essays-manifest.json are responsible
 *   for their own fallback when that manifest is unreachable.
 *
 * Known limitations
 *   The title anchor is stretched over the whole card, so any future
 *   secondary link inside the card would need position:relative to
 *   remain clickable.
 */

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; height: 100%; }

    .card {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: var(--card-bg, #fff);
      border: var(--card-border, 1px solid #ded6c9);
      border-radius: var(--card-radius, 2px);
      padding: var(--card-padding, 1.5rem);
      transition: border-color 120ms ease;
    }

    .card:hover { border-color: var(--color-signal, #00c853); }

    [data-pillar] {
      display: inline-block;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: var(--text-micro, 0.6875rem);
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--color-signal-ink, #06703a);
    }

    a[data-read-link] {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 1.0625rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--color-heading-display, #0d0d0d);
      line-height: 1.4;
      text-decoration: none;
      text-wrap: balance;
    }

    /* Stretch the title link over the card so the whole surface is a
       single, unambiguous target — one link, one destination. */
    a[data-read-link]::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
    }

    a[data-read-link]:hover { text-decoration: underline; }

    a[data-read-link]:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
      border-radius: 2px;
    }

    [data-description] {
      font-family: var(--font-body, system-ui, sans-serif);
      font-size: 0.9375rem;
      color: var(--color-mid, #4a4741);
      line-height: 1.6;
      margin: 0;
    }

    .card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-top: auto;
      padding-top: 0.75rem;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: var(--text-caption, 0.8125rem);
    }

    [data-date] {
      color: var(--color-muted, #6d6a63);
      font-variant-numeric: tabular-nums;
    }

    [data-read-time] {
      color: var(--color-muted, #6d6a63);
      font-variant-numeric: tabular-nums;
    }

    [data-read-time]:empty { display: none; }
  </style>

  <article class="card">
    <span data-pillar></span>
    <a data-read-link data-title href="#"></a>
    <p data-description></p>
    <div class="card__footer">
      <time data-date></time>
      <span data-read-time></span>
    </div>
  </article>
`;

export class EssayCard extends HTMLElement {
  static get observedAttributes() {
    return ["title", "slug", "date", "pillar", "description", "read-time"];
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
    const readTime = this.getAttribute("read-time") ?? "";

    root.querySelector("[data-pillar]").textContent = pillar;
    root.querySelector("[data-description]").textContent = description;
    root.querySelector("[data-read-time]").textContent = readTime ? `${readTime} min read` : "";

    const timeEl = root.querySelector("[data-date]");
    timeEl.setAttribute("datetime", date);
    timeEl.textContent = date
      ? new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" }).format(new Date(date))
      : "";

    const link = root.querySelector("[data-read-link]");
    link.textContent = title;
    link.setAttribute("href", `/thinking/${slug}.html`);
    link.setAttribute("aria-label", `Read: ${title}`);
  }
}
