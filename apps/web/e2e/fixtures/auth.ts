import { type Page,test as base } from "@playwright/test";

/**
 * Mock session data for authenticated tests
 */
const mockSession = {
  session: {
    id: "test-session-id",
    userId: "test-user-id",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    role: "user",
    createdAt: new Date("2024-01-01").toISOString(),
  },
};

/**
 * Sets up route interception to mock authenticated session
 */
async function setupAuthMock(page: Page) {
  await page.route("**/api/auth/get-session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockSession),
    });
  });
}

/**
 * Extended test with authenticated page fixture
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await setupAuthMock(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture
    await use(page);
  },
});

export { expect } from "@playwright/test";
