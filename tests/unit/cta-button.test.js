import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("<cta-button>", () => {
  beforeEach(async () => {
    const { CtaButton } = await import("../../components/cta-button.js");
    if (!customElements.get("cta-button")) {
      customElements.define("cta-button", CtaButton);
    }
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a primary button with correct label and href", () => {
    document.body.innerHTML = `<cta-button label="Explore Weyz" href="/building.html"></cta-button>`;
    const el = document.querySelector("cta-button");
    const root = el.shadowRoot ?? el;
    const link = root.querySelector("a");
    expect(link).not.toBeNull();
    expect(link.getAttribute("href")).toBe("/building.html");
    expect(link.textContent.trim()).toContain("Explore Weyz");
  });

  it("defaults to primary variant", () => {
    document.body.innerHTML = `<cta-button label="Go" href="/"></cta-button>`;
    const el = document.querySelector("cta-button");
    const root = el.shadowRoot ?? el;
    const link = root.querySelector("a");
    expect(link.classList.contains("cta--secondary")).toBe(false);
  });

  it("renders a secondary (outline) variant when variant='secondary'", () => {
    document.body.innerHTML = `<cta-button label="Learn more" href="/building.html" variant="secondary"></cta-button>`;
    const el = document.querySelector("cta-button");
    const root = el.shadowRoot ?? el;
    const link = root.querySelector("a");
    expect(link.classList.contains("cta--secondary")).toBe(true);
  });

  it("appends arrow character when arrow attribute is present", () => {
    document.body.innerHTML = `<cta-button label="Read the Essays" href="/thinking.html" arrow></cta-button>`;
    const el = document.querySelector("cta-button");
    const root = el.shadowRoot ?? el;
    const link = root.querySelector("a");
    expect(link.textContent).toContain("→");
  });

  it("uses the label as the accessible name", () => {
    document.body.innerHTML = `<cta-button label="Work with Avancier" href="/contact.html#founder"></cta-button>`;
    const el = document.querySelector("cta-button");
    const root = el.shadowRoot ?? el;
    const link = root.querySelector("a");
    expect(link.textContent.trim()).toContain("Work with Avancier");
  });
});
