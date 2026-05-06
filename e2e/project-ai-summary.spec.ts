import { test, expect } from "@playwright/test";

const SLUG = "incident-resolution-assistant";
const SUMMARY_URL = `**/api/projects/${SLUG}/summary`;

test.describe("ProjectAISummary on /projects/:slug", () => {
  test("shows mocked summary text after skeleton resolves", async ({
    page,
  }) => {
    await page.route(SUMMARY_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          summary: "Mocked summary: AI-assisted incident resolution at scale.",
          generatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto(`/projects/${SLUG}`);

    await expect(
      page.getByText("Mocked summary: AI-assisted incident resolution at scale.")
    ).toBeVisible({ timeout: 10000 });

    // Regenerate button should also be visible
    await expect(page.getByRole("button", { name: /Regenerate/i })).toBeVisible();
  });

  test("shows Summary unavailable and Retry button on API 500", async ({
    page,
  }) => {
    await page.route(SUMMARY_URL, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto(`/projects/${SLUG}`);

    await expect(page.getByText("Summary unavailable")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("button", { name: /Retry/i })).toBeVisible();
  });

  test("Retry button re-fetches and shows summary on success", async ({
    page,
  }) => {
    let callCount = 0;
    await page.route(SUMMARY_URL, async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Internal Server Error" }),
          contentType: "application/json",
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            summary: "Retry succeeded: full summary here.",
            generatedAt: new Date().toISOString(),
          }),
        });
      }
    });

    await page.goto(`/projects/${SLUG}`);
    await expect(page.getByText("Summary unavailable")).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("button", { name: /Retry/i }).click();

    await expect(
      page.getByText("Retry succeeded: full summary here.")
    ).toBeVisible({ timeout: 10000 });
  });
});
