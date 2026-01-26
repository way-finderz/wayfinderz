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


test.describe("Authentication", () => {
  test.describe("Login", () => {
    test("successful login redirects to dashboard", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      // Mock successful login
      await page.route("**/api/auth/sign-in/email", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: "user-1",
              name: "Test User",
              email: "test@example.com",
            },
            session: { id: "session-1" },
          }),
        });
      });

      // After login, session check returns authenticated
      let loginAttempted = false;
      await page.route("**/api/auth/get-session", async (route) => {
        if (loginAttempted) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              user: {
                id: "user-1",
                name: "Test User",
                email: "test@example.com",
                role: "user",
              },
              session: { id: "session-1", userId: "user-1" },
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(null),
          });
        }
      });

      const landing = new LandingPage(page);
      await landing.goto();

      // Fill in login form
      await landing.loginEmailInput.fill("test@example.com");
      await landing.loginPasswordInput.fill("password123");

      // Track that login was attempted
      loginAttempted = true;
      await landing.loginSubmitButton.click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });

    test("shows error for invalid credentials", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      // Mock login to return an error
      await page.route("**/api/auth/sign-in/email", async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            error: { message: "Invalid credentials" },
          }),
        });
      });

      const landing = new LandingPage(page);
      await landing.goto();

      await landing.login("invalid@example.com", "wrongpassword");

      await expect(landing.loginError).toBeVisible({ timeout: 10000 });
    });

    test("navigates to login page via link", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/login");

      await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/?$/);

      const landing = new LandingPage(page);
      await expect(landing.loginEmailInput).toBeVisible({ timeout: 10000 });
      await expect(landing.loginSubmitButton).toBeVisible();
    });
  });

  test.describe("Signup", () => {
    test("shows signup page with invite code validation", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      const signup = new SignupPage(page);
      await signup.goto();

      await expect(signup.inviteCodeInput).toBeVisible({ timeout: 10000 });

      await expect(signup.validateButton).toBeVisible();
    });

    test("validates invite code before showing signup form", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.route("**/trpc/invites.validate**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: {
                valid: false,
                message: "Invalid or expired invite code",
              },
            },
          }),
        });
      });

      const signup = new SignupPage(page);
      await signup.goto();

      await signup.enterInviteCode("INVALID1");
      await signup.validateCode();

      await expect(page.getByText(/Invalid or expired/i)).toBeVisible({ timeout: 10000 });
    });

    test("navigates to signup page with invite code from URL", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      // Mock the invite validation that happens automatically
      await page.route("**/trpc/invites.validate**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: {
                valid: true,
                message: "Invite code is valid",
              },
            },
          }),
        });
      });

      const signup = new SignupPage(page);
      await signup.goto("TESTCODE");

      // Wait for the useEffect to populate the value
      await expect(signup.inviteCodeInput).toHaveValue("TESTCODE", { timeout: 10000 });
    });
  });

  test.describe("Protected Routes", () => {
    test("redirects to login when accessing dashboard without auth", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/dashboard");

      await expect(page).toHaveURL(/\/(login)?$/, { timeout: 10000 });
    });

    test("redirects to login when accessing profile without auth", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/profile");

      await expect(page).toHaveURL(/\/(login)?$/, { timeout: 10000 });
    });

    test("redirects to login when accessing game without auth", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/game/road-to-rome");

      await expect(page).toHaveURL(/\/(login)?$/, { timeout: 10000 });
    });
  });

  test.describe("Admin Routes", () => {
    test("redirects non-admin users away from admin pages", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/admin/invites");

      await expect(page).not.toHaveURL("/admin/invites", { timeout: 10000 });
    });
  });
});
