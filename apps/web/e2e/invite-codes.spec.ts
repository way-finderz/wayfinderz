import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { LandingPage, SignupPage } from "./pages";

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

test.describe("Invite Code Flow", () => {
  test("can enter invite code on landing page and navigate to signup", async ({ page }) => {
    await mockUnauthenticatedSession(page);

    const landing = new LandingPage(page);
    await landing.goto();

    await landing.submitQuickRegister("TESTCODE");

    await expect(
      landing.quickRegisterError.or(page.getByTestId("invite-code-input"))
    ).toBeVisible({ timeout: 10000 });
  });

  test("shows validation on signup page", async ({ page }) => {
    await mockUnauthenticatedSession(page);

    await page.route("**/trpc/invites.validate**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: {
              valid: true,
            },
          },
        }),
      });
    });

    const signup = new SignupPage(page);
    await signup.goto();

    await signup.enterInviteCode("TESTCODE");

    await signup.validateCode();

    await expect(signup.validBadge).toBeVisible({ timeout: 10000 });
  });

  test("converts invite code to uppercase", async ({ page }) => {
    await mockUnauthenticatedSession(page);

    const signup = new SignupPage(page);
    await signup.goto();

    await signup.enterInviteCode("testcode");

    await expect(signup.inviteCodeInput).toHaveValue("TESTCODE");
  });
});
