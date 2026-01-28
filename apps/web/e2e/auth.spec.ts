import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { AuthGatePage, LandingPage, SignupPage } from "./pages";

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
    test("shows inline login form when accessing dashboard without auth", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/dashboard");

      // Should stay on dashboard URL (no redirect)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Should show inline login form
      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).toBeVisible();
      await expect(authGate.loginEmailInput).toBeVisible();
      await expect(authGate.loginSubmitButton).toBeVisible();
    });

    test("shows inline login form when accessing profile without auth", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/profile");

      // Should stay on profile URL (no redirect)
      await expect(page).toHaveURL(/\/profile/, { timeout: 10000 });

      // Should show inline login form
      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).toBeVisible();
      await expect(authGate.loginEmailInput).toBeVisible();
    });

    test("shows inline login form when accessing game without auth", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/game/road-to-rome");

      // Should stay on game URL (no redirect)
      await expect(page).toHaveURL(/\/game\/road-to-rome/, { timeout: 10000 });

      // Should show inline login form
      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).toBeVisible();
      await expect(authGate.loginEmailInput).toBeVisible();
    });

    test("can login from protected page and see content", async ({ page }) => {
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
                emailVerified: true,
                role: "user",
                createdAt: new Date().toISOString(),
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

      // Mock dashboard data
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      await page.route("**/trpc/game.getUserProgress**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      await page.goto("/dashboard");

      // Should see inline login form
      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).toBeVisible({ timeout: 10000 });

      // Login via the inline form
      loginAttempted = true;
      await authGate.login("test@example.com", "password123");

      // Should stay on dashboard and see dashboard content (redirected back to same page)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });

    test("shows sign up link in auth prompt", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/dashboard");

      const authGate = new AuthGatePage(page);
      await expect(authGate.signUpLink).toBeVisible({ timeout: 10000 });
      await expect(authGate.signUpLink).toHaveAttribute("href", /\/signup\/?/);
    });
  });

  test.describe("Admin Routes", () => {
    test("shows inline login form for unauthenticated users on admin pages", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/admin/invites");

      // Should stay on admin URL (no redirect)
      await expect(page).toHaveURL(/\/admin\/invites/, { timeout: 10000 });

      // Should show inline login form
      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).toBeVisible();
      await expect(authGate.loginEmailInput).toBeVisible();
    });

    test("shows access denied for non-admin authenticated users", async ({ page }) => {
      // Mock regular user session
      await page.route("**/api/auth/get-session", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: "user-1",
              name: "Regular User",
              email: "user@example.com",
              role: "user",
            },
            session: { id: "session-1", userId: "user-1" },
          }),
        });
      });

      await page.goto("/admin/invites");

      // Should stay on admin URL (no redirect)
      await expect(page).toHaveURL(/\/admin\/invites/, { timeout: 10000 });

      // Should show access denied message
      const authGate = new AuthGatePage(page);
      await expect(authGate.accessDeniedHeading).toBeVisible();
      await expect(authGate.accessDeniedMessage).toBeVisible();
      await expect(authGate.goToDashboardLink).toBeVisible();
    });

    test("access denied page links to dashboard", async ({ page }) => {
      // Mock regular user session
      await page.route("**/api/auth/get-session", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: "user-1",
              name: "Regular User",
              email: "user@example.com",
              role: "user",
            },
            session: { id: "session-1", userId: "user-1" },
          }),
        });
      });

      // Mock dashboard data for navigation
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      await page.route("**/trpc/game.getUserProgress**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      await page.goto("/admin/invites");

      const authGate = new AuthGatePage(page);
      await expect(authGate.goToDashboardLink).toBeVisible({ timeout: 10000 });

      await authGate.goToDashboardLink.click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });
  });
});
