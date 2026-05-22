import { test, expect } from "@playwright/test";

test.describe("US1 — Investor journey", () => {
  test("reads thesis, navigates to Building, submits investor enquiry", async ({ page }) => {
    await page.goto("/");

    /* Hero headline is the positioning statement */
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "I build the payment infrastructure African transport runs on."
    );

    /* Investor routing card present and linked correctly */
    const exploreLink = page.getByRole("link", { name: /Explore Weyz/i });
    await expect(exploreLink).toBeVisible();
    await exploreLink.click();

    /* Now on /building.html */
    await expect(page).toHaveURL(/building/);

    /* Weyz section and Avancier section visible with equal presence */
    await expect(page.getByRole("heading", { name: /Weyz Mobility/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Avancier Technologies/i })).toBeVisible();

    /* Investor CTA present */
    const investorCta = page.getByRole("link", { name: /Talk to us about Weyz/i });
    await expect(investorCta).toBeVisible();
    await investorCta.click();

    /* Anchors to #investor section on contact page */
    await expect(page).toHaveURL(/contact.*#investor|contact/);
    await expect(page.getByRole("heading", { name: /Discussing Weyz/i })).toBeVisible();

    /* Fill and submit the investor form */
    await page.getByLabel(/Name/i).first().fill("Test Investor");
    await page.getByLabel(/Organisation/i).fill("Test Capital");
    await page.getByLabel(/Role/i).fill("Partner");
    await page.getByLabel(/Email/i).first().fill("investor@test.com");
    await page.getByLabel(/Message/i).first().fill("Interested in Weyz Mobility.");

    /* We don't actually submit to Netlify in tests — just verify form is present */
    const submitBtn = page.getByRole("button", { name: /Send/i }).first();
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test("home page has no horizontal scroll at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test("audience routing cards stack vertically on 375px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const cards = page.locator(".audience-card");
    await expect(cards).toHaveCount(3);
    const boxes = await cards.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().left)
    );
    /* All cards should have the same left offset (stacked, not side-by-side) */
    const uniqueLefts = new Set(boxes.map((x) => Math.round(x)));
    expect(uniqueLefts.size).toBe(1);
  });
});
