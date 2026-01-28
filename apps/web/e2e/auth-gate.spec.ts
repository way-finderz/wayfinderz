import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { AuthGatePage } from "./pages";

/**
 * Tests for AuthGate and AdminGate components.
 *
 * These components replace the old ProtectedRoute and AdminRoute components
 * that used redirects. The new approach shows inline login forms instead of
 * redirecting, which fixes race conditions during session hydration on page refresh.
 */

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

// Helper to mock authenticated user session
async function mockAuthenticatedSession(page: Page, role: "user" | "admin" = "user") {
  await page.route("**/api/auth/get-session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
          emailVerified: true,
          role,
          createdAt: new Date().toISOString(),
        },
        session: { id: "session-1", userId: "user-1" },
      }),
    });
  });
}

// Helper to mock dashboard API endpoints
async function mockDashboardAPIs(page: Page) {
  await page.route("**/trpc/game.listJourneys**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          data: [
            {
              id: "journey-1",
              slug: "road-to-rome",
              name: "Road to Rome",
              description: "Travel from Venice to Rome!",
              language: "italian",
              startCityName: "venice",
              targetCityName: "rome",
              emoji: "it-flag",
              winMessage: "You Made It!",
            },
          ],
        },
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
}

test.describe("AuthGate Component", () => {
  test.describe("Loading State", () => {
    test("shows loading skeleton while session is being fetched", async ({ page }) => {
      // Delay the session response to see loading state
      await page.route("**/api/auth/get-session", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(null),
        });
      });

      await page.goto("/dashboard");

      // Loading skeleton should be visible initially
      // The skeleton contains rectangular elements
      await expect(page.locator('[class*="animate-pulse"]').first()).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe("Unauthenticated State", () => {
    test("shows sign in prompt with login form", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/dashboard");

      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).toBeVisible({ timeout: 10000 });
      await expect(authGate.loginEmailInput).toBeVisible();
      await expect(authGate.loginPasswordInput).toBeVisible();
      await expect(authGate.loginSubmitButton).toBeVisible();
    });

    test("URL does not change when viewing login prompt", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/dashboard");

      // URL should stay as /dashboard, not redirect
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).toBeVisible();
    });

    test("shows sign up link for new users", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/profile");

      const authGate = new AuthGatePage(page);
      await expect(authGate.signUpLink).toBeVisible({ timeout: 10000 });

      // Click signup link
      await authGate.signUpLink.click();

      await expect(page).toHaveURL(/\/signup/, { timeout: 10000 });
    });

    test("shows login error for invalid credentials", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.route("**/api/auth/sign-in/email", async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            error: { message: "Invalid credentials" },
          }),
        });
      });

      await page.goto("/dashboard");

      const authGate = new AuthGatePage(page);
      await expect(authGate.loginEmailInput).toBeVisible({ timeout: 10000 });

      await authGate.login("wrong@example.com", "badpassword");

      await expect(authGate.loginError).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Authenticated State", () => {
    test("shows protected content when authenticated", async ({ page }) => {
      await mockAuthenticatedSession(page);
      await mockDashboardAPIs(page);

      await page.goto("/dashboard");

      // Should see dashboard content (welcome message)
      await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 10000 });
    });

    test("does not show login prompt when authenticated", async ({ page }) => {
      await mockAuthenticatedSession(page);
      await mockDashboardAPIs(page);

      await page.goto("/dashboard");

      // Wait for page to load
      await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 10000 });

      // Login prompt should not be visible
      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).not.toBeVisible();
    });
  });

  test.describe("Page Refresh Behavior", () => {
    test("maintains session after page refresh", async ({ page }) => {
      await mockAuthenticatedSession(page);
      await mockDashboardAPIs(page);

      await page.goto("/dashboard");

      // Verify authenticated
      await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 10000 });

      // Refresh the page
      await page.reload();

      // Should still be authenticated (no redirect, content visible)
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 10000 });
    });

    test("shows login form after session expires and refresh", async ({ page }) => {
      let isAuthenticated = true;

      await page.route("**/api/auth/get-session", async (route) => {
        if (isAuthenticated) {
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

      await mockDashboardAPIs(page);

      await page.goto("/dashboard");

      // Verify authenticated
      await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 10000 });

      // Simulate session expiration
      isAuthenticated = false;

      // Refresh the page
      await page.reload();

      // Should stay on dashboard URL but show login form
      await expect(page).toHaveURL(/\/dashboard/);
      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Login Redirect Behavior", () => {
    test("redirects to same protected page after successful login", async ({ page }) => {
      let isAuthenticated = false;

      await page.route("**/api/auth/get-session", async (route) => {
        if (isAuthenticated) {
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

      await page.route("**/api/auth/sign-in/email", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: { id: "user-1", name: "Test User", email: "test@example.com" },
            session: { id: "session-1" },
          }),
        });
      });

      await mockDashboardAPIs(page);

      // Start at profile page
      await page.goto("/profile");

      // Should see login form
      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).toBeVisible({ timeout: 10000 });

      // Login
      isAuthenticated = true;
      await authGate.login("test@example.com", "password123");

      // Should redirect back to profile (the page we were on)
      await expect(page).toHaveURL(/\/profile/, { timeout: 10000 });
    });
  });
});

test.describe("AdminGate Component", () => {
  test.describe("Unauthenticated State", () => {
    test("shows login prompt for unauthenticated users", async ({ page }) => {
      await mockUnauthenticatedSession(page);

      await page.goto("/admin/invites");

      // Should stay on admin URL
      await expect(page).toHaveURL(/\/admin\/invites/, { timeout: 10000 });

      // Should show login prompt
      const authGate = new AuthGatePage(page);
      await expect(authGate.signInHeading).toBeVisible();
    });
  });

  test.describe("Non-Admin Authenticated State", () => {
    test("shows access denied for regular users", async ({ page }) => {
      await mockAuthenticatedSession(page, "user");

      await page.goto("/admin/invites");

      // Should stay on admin URL
      await expect(page).toHaveURL(/\/admin\/invites/, { timeout: 10000 });

      // Should show access denied
      const authGate = new AuthGatePage(page);
      await expect(authGate.accessDeniedHeading).toBeVisible();
      await expect(authGate.accessDeniedMessage).toBeVisible();
    });

    test("provides link to dashboard from access denied screen", async ({ page }) => {
      await mockAuthenticatedSession(page, "user");
      await mockDashboardAPIs(page);

      await page.goto("/admin/invites");

      const authGate = new AuthGatePage(page);
      await expect(authGate.goToDashboardLink).toBeVisible({ timeout: 10000 });

      await authGate.goToDashboardLink.click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });
  });

  test.describe("Admin Authenticated State", () => {
    test("shows admin content for admin users", async ({ page }) => {
      await mockAuthenticatedSession(page, "admin");

      await page.route("**/trpc/invites.list**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      await page.goto("/admin/invites");

      // Should show admin content
      await expect(page.getByRole("heading", { name: /invite codes/i })).toBeVisible({
        timeout: 10000,
      });
    });

    test("does not show access denied for admin users", async ({ page }) => {
      await mockAuthenticatedSession(page, "admin");

      await page.route("**/trpc/invites.list**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      await page.goto("/admin/invites");

      // Wait for page to load
      await expect(page.getByRole("heading", { name: /invite codes/i })).toBeVisible({
        timeout: 10000,
      });

      // Access denied should not be visible
      const authGate = new AuthGatePage(page);
      await expect(authGate.accessDeniedHeading).not.toBeVisible();
    });
  });

  test.describe("Admin Page Refresh Behavior", () => {
    test("maintains admin access after page refresh", async ({ page }) => {
      await mockAuthenticatedSession(page, "admin");

      await page.route("**/trpc/invites.list**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      await page.goto("/admin/invites");

      // Verify admin content
      await expect(page.getByRole("heading", { name: /invite codes/i })).toBeVisible({
        timeout: 10000,
      });

      // Refresh
      await page.reload();

      // Should still see admin content
      await expect(page).toHaveURL(/\/admin\/invites/);
      await expect(page.getByRole("heading", { name: /invite codes/i })).toBeVisible({
        timeout: 10000,
      });
    });
  });
});

test.describe("Header Navigation", () => {
  test("logo links to root path from protected route", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await mockDashboardAPIs(page);

    await page.goto("/dashboard");

    // Wait for page to load
    await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 10000 });

    // Verify logo links to root
    const logoLink = page.getByRole("link", { name: /way finderz/i });
    await expect(logoLink).toHaveAttribute("href", "/");
  });

  test("logo is visible in header for unauthenticated users", async ({ page }) => {
    await mockUnauthenticatedSession(page);

    await page.goto("/dashboard");

    // Wait for page to load
    const authGate = new AuthGatePage(page);
    await expect(authGate.signInHeading).toBeVisible({ timeout: 10000 });

    // Logo should be visible in header
    const logoLink = page.getByRole("link", { name: /way finderz/i });
    await expect(logoLink).toBeVisible();
  });
});
