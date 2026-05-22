import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("<site-nav>", () => {
  let el;

  beforeEach(async () => {
    const { SiteNav } = await import("../../components/site-nav.js");
    if (!customElements.get("site-nav")) {
      customElements.define("site-nav", SiteNav);
    }

    document.body.innerHTML = `
      <site-nav
        current-page="/"
        lang="en"
        en-path="/"
        fr-path="/fr/"
      ></site-nav>
    `;
    el = document.querySelector("site-nav");
    await customElements.whenDefined("site-nav");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders all five navigation links", () => {
    const links = el.shadowRoot?.querySelectorAll("nav a") ?? el.querySelectorAll("nav a");
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/building.html");
    expect(hrefs).toContain("/thinking.html");
    expect(hrefs).toContain("/about.html");
    expect(hrefs).toContain("/contact.html");
  });

  it("marks the current page link with aria-current='page'", () => {
    const root = el.shadowRoot ?? el;
    const activeLink = root.querySelector("[aria-current='page']");
    expect(activeLink).not.toBeNull();
    expect(activeLink.getAttribute("href")).toBe("/");
  });

  it("hamburger button has aria-expanded='false' initially", () => {
    const root = el.shadowRoot ?? el;
    const btn = root.querySelector("[aria-controls='mobile-menu']");
    expect(btn).not.toBeNull();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("toggles aria-expanded when hamburger is clicked", () => {
    const root = el.shadowRoot ?? el;
    const btn = root.querySelector("[aria-controls='mobile-menu']");
    btn.click();
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    btn.click();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("mobile menu has role='dialog' or role='navigation' when open", () => {
    const root = el.shadowRoot ?? el;
    const btn = root.querySelector("[aria-controls='mobile-menu']");
    btn.click();
    const menu = root.querySelector("#mobile-menu");
    expect(menu).not.toBeNull();
    const isVisible = menu.getAttribute("aria-hidden") !== "true";
    expect(isVisible).toBe(true);
  });

  it("renders language toggle with EN and FR options", () => {
    const root = el.shadowRoot ?? el;
    const toggle = root.querySelector("[data-lang-toggle]");
    expect(toggle).not.toBeNull();
    expect(toggle.textContent).toContain("EN");
    expect(toggle.textContent).toContain("FR");
  });

  it("marks the active language", () => {
    const root = el.shadowRoot ?? el;
    const activeLang = root.querySelector("[data-lang-toggle] [aria-current='true']");
    expect(activeLang).not.toBeNull();
    expect(activeLang.textContent.trim()).toBe("EN");
  });
});
