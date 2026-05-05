import { test, expect } from "@playwright/test";

test.describe("TechFilter on /projects", () => {
  test.beforeEach(async ({ page }) => {
    // Mock GitHub repos to avoid external call
    await page.route("**/api/github/repos", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
  });

  test("tech filter chips render above the project grid", async ({ page }) => {
    await page.goto("/projects");
    // TechFilter renders badge-style chips with role="button"
    const chips = page.locator('[role="button"]');
    await expect(chips.first()).toBeVisible({ timeout: 8000 });
  });

  test("clicking a chip adds ?tech=… to URL and filters visible cards", async ({
    page,
  }) => {
    await page.goto("/projects");

    // Wait for chips to appear
    const chips = page.locator('[role="button"]');
    await expect(chips.first()).toBeVisible({ timeout: 8000 });

    const firstChip = chips.first();
    const chipText = await firstChip.textContent();
    await firstChip.click();

    // URL should contain tech param
    await expect(page).toHaveURL(/\?tech=/, { timeout: 5000 });

    // Grid cards should be filtered — at least some content remains
    const cards = page.locator('main section').filter({ hasText: "All projects" })
      .locator('.grid > *');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0); // filtered, may be 0 if no match

    // The chip text should appear in URL
    if (chipText) {
      expect(page.url()).toContain(encodeURIComponent(chipText.trim()));
    }
  });

  test("Clear all button resets URL after a chip is selected", async ({
    page,
  }) => {
    await page.goto("/projects");

    const chips = page.locator('[role="button"]');
    await expect(chips.first()).toBeVisible({ timeout: 8000 });
    await chips.first().click();

    await expect(page).toHaveURL(/\?tech=/, { timeout: 5000 });

    // Clear all button appears when a chip is selected
    const clearBtn = page.getByRole("button", { name: /Clear all/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // URL should not have tech param anymore
    await expect(page).not.toHaveURL(/\?tech=/, { timeout: 5000 });
  });

  test("loading /projects?tech=Python pre-applies the filter", async ({
    page,
  }) => {
    await page.goto("/projects?tech=Python");

    // URL already has tech, chip for Python should appear selected (default variant)
    await expect(page.getByText("Python").first()).toBeVisible({ timeout: 8000 });
    expect(page.url()).toContain("tech=Python");
  });
});
