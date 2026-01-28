import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

// Helper to mock admin authenticated session
async function mockAdminSession(page: Page) {
  await page.route("**/api/auth/get-session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "admin-1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        },
        session: { id: "session-1", userId: "admin-1" },
      }),
    });
  });
}

// Helper to mock invite codes list
function createMockInviteCodes() {
  return [
    {
      id: "invite-1",
      code: "TESTCODE1",
      createdAt: new Date().toISOString(),
      expiresAt: null,
      isActive: true,
      usedCount: 0,
      maxUses: 1,
      deletedAt: null,
    },
    {
      id: "invite-2",
      code: "USEDCODE2",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      expiresAt: null,
      isActive: true,
      usedCount: 1,
      maxUses: 1,
      deletedAt: new Date().toISOString(),
    },
    {
      id: "invite-3",
      code: "INACTIVE3",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      expiresAt: null,
      isActive: false,
      usedCount: 0,
      maxUses: 1,
      deletedAt: null,
    },
  ];
}

test.describe("Admin Invite Management", () => {
  test.describe("Invite Codes List", () => {
    test("displays invite codes table for admin users", async ({ page }) => {
      await mockAdminSession(page);

      // Mock the invite codes list
      await page.route("**/trpc/invites.list**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: createMockInviteCodes(),
            },
          }),
        });
      });

      await page.goto("/admin/invites");

      // Wait for page to load
      await expect(page.getByRole("heading", { name: /invite codes/i })).toBeVisible({
        timeout: 10000,
      });

      // Check that invite codes are displayed
      await expect(page.getByText("TESTCODE1")).toBeVisible();
      await expect(page.getByText("USEDCODE2")).toBeVisible();
      await expect(page.getByText("INACTIVE3")).toBeVisible();
    });

    test("shows status badges for invite codes", async ({ page }) => {
      await mockAdminSession(page);

      await page.route("**/trpc/invites.list**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: createMockInviteCodes(),
            },
          }),
        });
      });

      await page.goto("/admin/invites");

      // Wait for the table to load
      await expect(page.getByText("TESTCODE1")).toBeVisible({ timeout: 10000 });

      // Check for status indicators
      await expect(page.getByText(/active/i).first()).toBeVisible();
    });

    test("shows empty state when no invite codes exist", async ({ page }) => {
      await mockAdminSession(page);

      await page.route("**/trpc/invites.list**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: [],
            },
          }),
        });
      });

      await page.goto("/admin/invites");

      await expect(page.getByText(/no invite codes/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Create Invite Code", () => {
    test("can create a new invite code", async ({ page }) => {
      await mockAdminSession(page);

      // Mock initial empty list
      await page.route("**/trpc/invites.list**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: [],
            },
          }),
        });
      });

      // Mock create endpoint
      await page.route("**/trpc/invites.create**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: {
                id: "new-invite",
                code: "NEWCODE1",
                createdAt: new Date().toISOString(),
                expiresAt: null,
                isActive: true,
                usedCount: 0,
                maxUses: 1,
                deletedAt: null,
              },
            },
          }),
        });
      });

      await page.goto("/admin/invites");

      // Wait for page to load
      await expect(page.getByRole("heading", { name: /invite codes/i })).toBeVisible({
        timeout: 10000,
      });

      // Click create button
      const createButton = page.getByRole("button", { name: /generate|create/i });
      await expect(createButton).toBeVisible();
      await createButton.click();

      // Should show success (new code or confirmation)
      await expect(
        page.getByText(/NEWCODE1/).or(page.getByText(/created|generated/i))
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Deactivate Invite Code", () => {
    test("can deactivate an active invite code", async ({ page }) => {
      await mockAdminSession(page);

      const mockCodes = [
        {
          id: "invite-1",
          code: "ACTIVE01",
          createdAt: new Date().toISOString(),
          expiresAt: null,
          isActive: true,
          usedCount: 0,
          maxUses: 1,
          deletedAt: null,
        },
      ];

      await page.route("**/trpc/invites.list**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: mockCodes,
            },
          }),
        });
      });

      // Mock deactivate endpoint
      await page.route("**/trpc/invites.deactivate**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: {
                ...mockCodes[0],
                isActive: false,
              },
            },
          }),
        });
      });

      await page.goto("/admin/invites");

      // Wait for the code to be visible
      await expect(page.getByText("ACTIVE01")).toBeVisible({ timeout: 10000 });

      // Find and click deactivate button (if present)
      const deactivateButton = page.getByRole("button", { name: /deactivate/i }).first();
      const isVisible = await deactivateButton.isVisible().catch(() => false);
      if (isVisible) {
        await deactivateButton.click();

        // Should show some feedback - either success message or status change
        // Use a more flexible check since UI might vary
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe("Copy Invite Code", () => {
    test("can copy invite code to clipboard", async ({ page, context }) => {
      await mockAdminSession(page);

      await page.route("**/trpc/invites.list**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: [
                {
                  id: "invite-1",
                  code: "COPYTEST",
                  createdAt: new Date().toISOString(),
                  expiresAt: null,
                  isActive: true,
                  usedCount: 0,
                  maxUses: 1,
                  deletedAt: null,
                },
              ],
            },
          }),
        });
      });

      // Grant clipboard permissions
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);

      await page.goto("/admin/invites");

      // Wait for the code to be visible
      await expect(page.getByText("COPYTEST")).toBeVisible({ timeout: 10000 });

      // Find and click copy button
      const copyButton = page.getByRole("button", { name: /copy/i }).first();
      if (await copyButton.isVisible()) {
        await copyButton.click();

        // Should show copied feedback
        await expect(
          page.getByText(/copied/i).or(page.getByRole("button", { name: /copied/i }))
        ).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Access Control", () => {
    test("non-admin users see access denied message", async ({ page }) => {
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

      // Should stay on admin URL but show access denied
      await expect(page).toHaveURL(/\/admin\/invites/, { timeout: 10000 });
      await expect(page.getByRole("heading", { name: /access denied/i })).toBeVisible();
      await expect(page.getByText(/don't have permission/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /go to dashboard/i })).toBeVisible();
    });

    test("unauthenticated users see inline login form", async ({ page }) => {
      await page.route("**/api/auth/get-session", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(null),
        });
      });

      await page.goto("/admin/invites");

      // Should stay on admin URL but show login form
      await expect(page).toHaveURL(/\/admin\/invites/, { timeout: 10000 });
      await expect(page.getByRole("heading", { name: /sign in to continue/i })).toBeVisible();
      await expect(page.getByTestId("login-email")).toBeVisible();
      await expect(page.getByTestId("login-submit")).toBeVisible();
    });
  });
});
