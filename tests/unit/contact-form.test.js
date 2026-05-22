import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("<contact-form>", () => {
  beforeEach(async () => {
    const { ContactForm } = await import("../../components/contact-form.js");
    if (!customElements.get("contact-form")) {
      customElements.define("contact-form", ContactForm);
    }
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  function getForm(id = "investor-enquiry") {
    document.body.innerHTML = `
      <contact-form
        form-name="${id}"
        fields='["name","organisation","role","email","message"]'
      ></contact-form>
    `;
    return document.querySelector("contact-form");
  }

  it("renders all declared fields", () => {
    const el = getForm();
    const root = el.shadowRoot ?? el;
    expect(root.querySelector("[name='name']")).not.toBeNull();
    expect(root.querySelector("[name='organisation']")).not.toBeNull();
    expect(root.querySelector("[name='role']")).not.toBeNull();
    expect(root.querySelector("[name='email']")).not.toBeNull();
    expect(root.querySelector("[name='message']")).not.toBeNull();
  });

  it("every visible input has an associated <label>", () => {
    const el = getForm();
    const root = el.shadowRoot ?? el;
    const inputs = root.querySelectorAll("input:not([type='hidden']), textarea, select");
    inputs.forEach((input) => {
      const id = input.getAttribute("id");
      expect(id, `input[name=${input.name}] must have an id`).toBeTruthy();
      const label = root.querySelector(`label[for="${id}"]`);
      expect(label, `label[for="${id}"] must exist`).not.toBeNull();
    });
  });

  it("submit button has a descriptive accessible name", () => {
    const el = getForm();
    const root = el.shadowRoot ?? el;
    const btn = root.querySelector("button[type='submit']");
    expect(btn).not.toBeNull();
    const name = btn.getAttribute("aria-label") ?? btn.textContent.trim();
    expect(name.length).toBeGreaterThan(0);
  });

  it("shows inline success message after successful submission", async () => {
    const el = getForm();
    const root = el.shadowRoot ?? el;

    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });

    const form = root.querySelector("form");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 50));

    const success = root.querySelector("[data-success]");
    expect(success).not.toBeNull();
    expect(success.textContent).toContain("We'll be in touch");
  });

  it("shows inline error message on submission failure", async () => {
    const el = getForm();
    const root = el.shadowRoot ?? el;

    global.fetch = vi.fn().mockRejectedValueOnce(new Error("network error"));

    const form = root.querySelector("form");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 50));

    const error = root.querySelector("[data-error]");
    expect(error).not.toBeNull();
    expect(error.textContent.length).toBeGreaterThan(0);
  });

  it("sets required attribute on mandatory fields", () => {
    const el = getForm();
    const root = el.shadowRoot ?? el;
    expect(root.querySelector("[name='name']").required).toBe(true);
    expect(root.querySelector("[name='email']").required).toBe(true);
  });

  it("accepts form-name attribute and uses it in the Netlify hidden input", () => {
    const el = getForm("press-enquiry");
    const root = el.shadowRoot ?? el;
    const hidden = root.querySelector("input[name='form-name']");
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe("press-enquiry");
  });
});
