import { test, expect } from "@playwright/test";

test.describe("Website Health Checks", () => {
  test("homepage loads and displays hero section with name and title", async ({
    page,
  }) => {
    await page.goto("/");

    // Check for hero section elements
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();

    // Check for name (Sahil)
    const name = page.locator("h1, h2, h3").filter({ hasText: /Sahil/i });
    await expect(name.first()).toBeVisible();

    // Check for title/role text
    const title = page.locator("h2, h3, p").filter({
      hasText: /Developer|Engineer|Full-stack|Product/i,
    });
    await expect(title.first()).toBeVisible();
  });

  test("navigation to /projects page is accessible", async ({ page }) => {
    await page.goto("/");

    // Try to navigate to projects
    await page.goto("/projects");

    // Verify we're on the projects page
    await expect(page).toHaveURL(/\/projects/);

    // Look for project-related content
    const pageContent = page.locator("h1, h2");
    await expect(pageContent.first()).toBeVisible();
  });

  test("CommandPalette opens with Cmd/Ctrl+K and closes", async ({ page }) => {
    await page.goto("/");

    // Open command palette with Cmd/Ctrl+K
    await page.keyboard.press("Control+K");

    // Check if palette is visible
    const palette = page.locator('[role="dialog"], [role="combobox"]').first();
    await expect(palette).toBeVisible({ timeout: 5000 });

    // Close with Escape
    await page.keyboard.press("Escape");

    // Palette should be hidden
    await expect(palette).not.toBeVisible({ timeout: 2000 });
  });

  test("Projects page loads and displays GitHub projects", async ({ page }) => {
    await page.goto("/projects");

    // Wait for projects to load (they come from /api/github/repos)
    const projectCards = page.locator('[class*="card"], [class*="project"], article');
    await expect(projectCards.first()).toBeVisible({ timeout: 10000 });

    // Check for project-related content (title, description, etc)
    const content = page.locator("h3, h4, p");
    await expect(content.first()).toBeVisible();
  });

  test("API /healthz endpoint returns 200", async ({ page }) => {
    const response = await page.request.get("http://localhost:8787/healthz");
    expect(response.status()).toBe(200);
  });

  test("API /api/github/repos endpoint returns valid data", async ({
    page,
  }) => {
    const response = await page.request.get(
      "http://localhost:8787/api/github/repos"
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
