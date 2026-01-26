import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { LandingPage } from "./pages";

// Helper to mock unauthenticated session
async function mockUnauthenticatedSession(page: Page) {
  await page.route("**/api/auth/get-session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(null),
    });
  });
}

test.describe("Landing Page", () => {
  test("displays the landing page with login and signup options", async ({ page }) => {
    await mockUnauthenticatedSession(page);

    const landing = new LandingPage(page);
    await landing.goto();

    await expect(page).toHaveTitle(/Way Finderz/);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });

    await expect(landing.loginEmailInput).toBeVisible();
    await expect(landing.loginPasswordInput).toBeVisible();
    await expect(landing.loginSubmitButton).toBeVisible();
  });

  test("shows quick registration form", async ({ page }) => {
    await mockUnauthenticatedSession(page);

    const landing = new LandingPage(page);
    await landing.goto();

    await expect(page.getByRole("heading", { name: /quick student registration/i })).toBeVisible({ timeout: 10000 });

    await expect(landing.quickRegisterInput).toBeVisible();
    await expect(landing.quickRegisterSubmit).toBeVisible();
  });
});
