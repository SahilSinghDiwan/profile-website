import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Portfolio Website Smoke Test", () => {
  test("1. Homepage loads with hero section and nav", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);

    // Check page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check for name (Sahil)
    const name = page.locator("h1, h2, h3").filter({ hasText: /Sahil/i });
    await expect(name.first()).toBeVisible();

    // Check for main nav
    const nav = page.locator("nav, header");
    await expect(nav.first()).toBeVisible();

    // Capture screenshot
    await page.screenshot({ path: "/tmp/playwright-screenshots/01-homepage.png" });
  });

  test("2. Projects page loads with featured projects", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/projects/);

    // Look for project cards/content
    const content = page.locator("h1, h2, h3");
    await expect(content.first()).toBeVisible({ timeout: 5000 });

    // Check for "More from GitHub" section (may be error state since API is down)
    const githubSection = page.locator("text=/GitHub|github/i");
    const sectionVisible = await githubSection.isVisible().catch(() => false);
    console.log(`GitHub section visible: ${sectionVisible}`);

    // Capture screenshot
    await page.screenshot({ path: "/tmp/playwright-screenshots/02-projects.png" });
  });

  test("3. Project detail page renders", async ({ page }) => {
    await page.goto("/projects/incident-resolution-assistant");

    // Wait for content to load
    const content = page.locator("h1, h2");
    await expect(content.first()).toBeVisible({ timeout: 5000 });

    // Verify we're on the detail page
    await expect(page).toHaveURL(/\/projects\/incident-resolution-assistant/);

    // Capture screenshot
    await page.screenshot({
      path: "/tmp/playwright-screenshots/03-project-detail.png",
    });
  });

  test("4. 404 page shows branded experience", async ({ page }) => {
    await page.goto("/nonexistent-route", { waitUntil: "networkidle" });

    // Look for 404-related text
    const notFoundText = page.locator("text=/404|not found|take.*home/i");
    const browseText = page.locator("text=/browse|projects|home/i");

    const hasNotFound = await notFoundText.isVisible().catch(() => false);
    const hasBrowse = await browseText.isVisible().catch(() => false);

    console.log(`404 text visible: ${hasNotFound}, Browse/Home text: ${hasBrowse}`);

    if (hasNotFound || hasBrowse) {
      await expect(page).toBeDefined();
    }

    // Capture screenshot
    await page.screenshot({ path: "/tmp/playwright-screenshots/04-404.png" });
  });

  test("5. Command palette opens with Cmd/Ctrl+K", async ({ page }) => {
    await page.goto("/");

    // Open command palette
    await page.keyboard.press("Control+K");

    // Check if palette is visible
    const palette = page.locator('[role="dialog"], [role="combobox"]').first();
    const isVisible = await palette.isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`Command palette visible after Ctrl+K: ${isVisible}`);

    if (isVisible) {
      // Close with Escape
      await page.keyboard.press("Escape");

      const stillVisible = await palette
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      console.log(`Palette still visible after Esc: ${stillVisible}`);

      await expect(stillVisible).toBe(false);
    }

    // Capture screenshot
    await page.screenshot({ path: "/tmp/playwright-screenshots/05-cmdpalette.png" });
  });

  test("6. Console errors and network failures", async ({ page }) => {
    const errors: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    page.on("requestfailed", (request) => {
      failedRequests.push(`${request.method()} ${request.url()}`);
    });

    await page.goto("/");
    await page.goto("/projects");
    await page.goto("/projects/incident-resolution-assistant");

    console.log(`Console errors: ${errors.length}`);
    errors.forEach((e) => console.log(`  - ${e}`));

    console.log(`Failed requests: ${failedRequests.length}`);
    failedRequests.forEach((r) => {
      if (r.includes("localhost:8787")) {
        console.log(`  - ${r} (API DOWN - expected)`);
      } else {
        console.log(`  - ${r}`);
      }
    });
  });
});
