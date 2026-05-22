import { describe, it, expect, beforeEach } from "vitest";
import { runAxe } from "../fixtures/setup.js";

describe("axe-core smoke test", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("reports zero violations on a valid accessible button", async () => {
    container.innerHTML = `
      <button type="button" aria-label="Close dialog">
        <span aria-hidden="true">×</span>
      </button>
    `;

    const results = await runAxe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("detects a missing alt attribute as a violation", async () => {
    container.innerHTML = `<img src="photo.jpg">`;
    const results = await runAxe(container);
    const imageAltRule = results.violations.find((v) => v.id === "image-alt");
    expect(imageAltRule).toBeDefined();
  });
});
