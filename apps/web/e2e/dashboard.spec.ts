import { expect, test } from "./fixtures/auth";
import { DashboardPage, ProfilePage } from "./pages";

const mockJourneys = [
  {
    id: "journey-1",
    slug: "road-to-rome",
    name: "Road to Rome",
    description: "Travel from Venice to Rome by translating Italian words!",
    language: "italian",
    startCityName: "venice",
    targetCityName: "rome",
    emoji: "🇮🇹",
    winMessage: "You Made It to Rome!",
  },
  {
    id: "journey-2",
    slug: "camino-de-santiago",
    name: "Camino de Santiago",
    description: "Walk the ancient pilgrim path from Barcelona to Santiago de Compostela!",
    language: "spanish",
    startCityName: "barcelona",
    targetCityName: "santiago",
    emoji: "🐚",
    winMessage: "You Made It to Santiago!",
  },
  {
    id: "journey-3",
    slug: "from-the-sea-to-the-sky",
    name: "From the Sea to the Sky",
    description: "Journey from Calais to the French Alps in Bourg-Saint-Maurice!",
    language: "french",
    startCityName: "calais",
    targetCityName: "bourg-saint-maurice",
    emoji: "⛷️",
    winMessage: "You Made It to the Alps!",
  },
];

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Mock the listJourneys API
    await page.route("**/trpc/game.listJourneys**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: mockJourneys,
          },
        }),
      });
    });

    // Mock the getUserProgress API
    await page.route("**/trpc/game.getUserProgress**", async (route) => {
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
  });

  test("displays welcome message with user name", async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.welcomeHeading).toContainText("Test User", { timeout: 10000 });
  });

  test("shows subtitle about learning languages", async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.welcomeSubtitle).toContainText("Learn the language, find your way", { timeout: 10000 });
  });

  test.describe("Journey Tiles", () => {
    test("displays all three journey tiles", async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.journeyTile("road-to-rome")).toBeVisible({ timeout: 10000 });
      await expect(dashboard.journeyTile("camino-de-santiago")).toBeVisible();
      await expect(dashboard.journeyTile("from-the-sea-to-the-sky")).toBeVisible();
    });

    test("shows journey emojis", async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(page.getByText("🇮🇹")).toBeVisible({ timeout: 10000 });
      await expect(page.getByText("🐚")).toBeVisible();
      await expect(page.getByText("⛷️")).toBeVisible();
    });

    test("shows journey descriptions", async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(
        page.getByText(/travel from venice to rome/i)
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByText(/walk the ancient pilgrim path/i)
      ).toBeVisible();
      await expect(
        page.getByText(/journey from calais to the french alps/i)
      ).toBeVisible();
    });

    test("shows language labels for each journey", async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(page.getByText(/learn italian/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/learn spanish/i)).toBeVisible();
      await expect(page.getByText(/learn french/i)).toBeVisible();
    });

    test("Italian journey tile links to correct game page", async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.journeyTile("road-to-rome")).toBeVisible({ timeout: 10000 });
      await dashboard.selectJourney("road-to-rome");

      await expect(page).toHaveURL(/\/game\/road-to-rome\/?$/);
    });

    test("Spanish journey tile links to correct game page", async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.journeyTile("camino-de-santiago")).toBeVisible({ timeout: 10000 });
      await dashboard.selectJourney("camino-de-santiago");

      await expect(page).toHaveURL(/\/game\/camino-de-santiago\/?$/);
    });

    test("French journey tile links to correct game page", async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.journeyTile("from-the-sea-to-the-sky")).toBeVisible({ timeout: 10000 });
      await dashboard.selectJourney("from-the-sea-to-the-sky");

      await expect(page).toHaveURL(/\/game\/from-the-sea-to-the-sky\/?$/);
    });
  });

  test.describe("Loading and Empty States", () => {
    test("shows loading state while fetching journeys", async ({
      authenticatedPage: page,
    }) => {
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: mockJourneys,
            },
          }),
        });
      });

      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.loadingState).toBeVisible();
    });

    test("shows empty state when no journeys available", async ({
      authenticatedPage: page,
    }) => {
      await page.route("**/trpc/game.listJourneys**", async (route) => {
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

      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.emptyState).toBeVisible({ timeout: 10000 });
    });

    test("shows error state when API fails", async ({
      authenticatedPage: page,
    }) => {
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              message: "Internal server error",
            },
          }),
        });
      });

      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.errorState).toBeVisible({ timeout: 10000 });
      await expect(dashboard.retryButton).toBeVisible();
    });

    test("shows error state when network request fails", async ({
      authenticatedPage: page,
    }) => {
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.abort("failed");
      });

      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.errorState).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/failed to load journeys/i)).toBeVisible();
    });
  });
});

test.describe("Profile Page", () => {
  test("displays user information", async ({ authenticatedPage: page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();

    await expect(
      page.getByRole("heading", { name: /profile/i })
    ).toBeVisible();

    await expect(profile.name).toContainText("Test User");
    await expect(profile.email).toContainText("test@example.com");
    await expect(profile.role).toBeVisible();
  });

  test("shows Member Since date", async ({ authenticatedPage: page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();

    await expect(profile.memberSince).toBeVisible();
  });

  test("Sign Out button logs user out", async ({ authenticatedPage: page }) => {
    let signedOut = false;

    await page.unrouteAll();

    await page.route("**/api/auth/get-session", async (route) => {
      if (signedOut) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ session: null, user: null }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
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
          }),
        });
      }
    });

    await page.route("**/api/auth/sign-out", async (route) => {
      signedOut = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    const profile = new ProfilePage(page);
    await profile.goto();

    await expect(profile.signOutButton).toBeVisible();
    await profile.signOut();

    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/?$/);
  });
});
