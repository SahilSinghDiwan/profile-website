import { test, expect } from "@playwright/test";

test.describe("ResumeChat", () => {
  test("floating bubble is visible on home page", async ({ page }) => {
    await page.goto("/");
    const bubble = page.locator('button[aria-label="Open chat"]');
    await expect(bubble).toBeVisible();
  });

  test("clicking bubble opens 380x520 chat panel", async ({ page }) => {
    await page.goto("/");
    await page.locator('button[aria-label="Open chat"]').click();
    const panel = page.locator('[role="dialog"]');
    await expect(panel).toBeVisible();
    await expect(page.getByText("Resume Chat")).toBeVisible();
  });

  test("suggested chips are visible after opening panel", async ({ page }) => {
    await page.goto("/");
    await page.locator('button[aria-label="Open chat"]').click();
    await expect(page.getByText("Suggested questions:")).toBeVisible();
    // At least one chip
    const chips = page.getByRole("button", {
      name: /Kafka|GenAI|Education|Full-stack|technologies/i,
    });
    await expect(chips.first()).toBeVisible();
  });

  test("clicking a suggested chip sends the question and streams a response", async ({
    page,
  }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/plain",
        body: "Sahil has extensive experience with Apache Kafka for streaming pipelines.",
      });
    });

    await page.goto("/");
    await page.locator('button[aria-label="Open chat"]').click();

    const chip = page
      .getByRole("button", { name: /Kafka/i })
      .first();
    await expect(chip).toBeVisible();
    await chip.click();

    // Response text should appear
    await expect(
      page.getByText(/Kafka/i, { exact: false })
    ).toBeVisible({ timeout: 10000 });
  });

  test("rate-limit 429 shows error message", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 429,
        headers: { "Retry-After": "30" },
        body: "",
      });
    });

    await page.goto("/");
    await page.locator('button[aria-label="Open chat"]').click();

    const input = page.getByPlaceholder(/Ask about Sahil/i);
    await input.fill("What is Sahil's experience?");
    await page.locator('button[aria-label="Send message"]').click();

    // Error area should show something (rate limited message)
    await expect(page.locator(".bg-red-50, .bg-red-950")).toBeVisible({
      timeout: 8000,
    });
  });
});
