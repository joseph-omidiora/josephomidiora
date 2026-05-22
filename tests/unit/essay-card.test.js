import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("<essay-card>", () => {
  let el;

  beforeEach(async () => {
    const { EssayCard } = await import("../../components/essay-card.js");
    if (!customElements.get("essay-card")) {
      customElements.define("essay-card", EssayCard);
    }

    document.body.innerHTML = `
      <essay-card
        title="Why African Transport Payments Are Broken"
        slug="african-transport-payments"
        date="2026-03-15"
        pillar="Infrastructure Intelligence"
        description="The transaction gap in Nigerian public transport is not a consumer problem. It is a data infrastructure problem."
      ></essay-card>
    `;
    el = document.querySelector("essay-card");
    await customElements.whenDefined("essay-card");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the essay title", () => {
    const root = el.shadowRoot ?? el;
    const title = root.querySelector("[data-title]");
    expect(title).not.toBeNull();
    expect(title.textContent).toContain("Why African Transport Payments Are Broken");
  });

  it("renders the pillar tag", () => {
    const root = el.shadowRoot ?? el;
    const tag = root.querySelector("[data-pillar]");
    expect(tag).not.toBeNull();
    expect(tag.textContent.trim()).toBe("Infrastructure Intelligence");
  });

  it("renders the formatted date", () => {
    const root = el.shadowRoot ?? el;
    const date = root.querySelector("[data-date]");
    expect(date).not.toBeNull();
    expect(date.textContent.trim()).toMatch(/2026/);
  });

  it("renders the description", () => {
    const root = el.shadowRoot ?? el;
    const desc = root.querySelector("[data-description]");
    expect(desc).not.toBeNull();
    expect(desc.textContent).toContain("data infrastructure problem");
  });

  it("renders a 'Read' link pointing to the correct essay slug", () => {
    const root = el.shadowRoot ?? el;
    const link = root.querySelector("a[data-read-link]");
    expect(link).not.toBeNull();
    expect(link.getAttribute("href")).toBe("/thinking/african-transport-payments.html");
  });

  it("read link has descriptive text for screen readers", () => {
    const root = el.shadowRoot ?? el;
    const link = root.querySelector("a[data-read-link]");
    const accessible = link.getAttribute("aria-label") ?? link.textContent;
    expect(accessible).toMatch(/Read/i);
  });
});
