import { expect, test } from "./fixtures/auth";
import { GamePage } from "./pages";

const mockJourney = {
  id: "journey-1",
  slug: "road-to-rome",
  name: "Road to Rome",
  description: "Travel from Venice to Rome by translating Italian words!",
  language: "italian",
  startCityName: "venice",
  targetCityName: "rome",
  emoji: "🇮🇹",
  winMessage: "You Made It to Rome!",
};

const mockCities = [
  { id: "venice", name: "venice", displayName: "Venice", position: 0 },
  { id: "padua", name: "padua", displayName: "Padua", position: 1 },
  { id: "bologna", name: "bologna", displayName: "Bologna", position: 2 },
  { id: "florence", name: "florence", displayName: "Florence", position: 3 },
  { id: "rome", name: "rome", displayName: "Rome", position: 4 },
];

const mockEdges = [
  { id: "edge-1", fromCityId: "venice", toCityId: "padua" },
  { id: "edge-2", fromCityId: "venice", toCityId: "bologna" },
  { id: "edge-3", fromCityId: "padua", toCityId: "florence" },
  { id: "edge-4", fromCityId: "bologna", toCityId: "florence" },
  { id: "edge-5", fromCityId: "florence", toCityId: "rome" },
];

const mockTranslations = [
  { id: "trans-1", sourceWord: "ciao", targetWord: "hello" },
  { id: "trans-2", sourceWord: "grazie", targetWord: "thank you" },
  { id: "trans-3", sourceWord: "buongiorno", targetWord: "good morning" },
  { id: "trans-4", sourceWord: "prego", targetWord: "you're welcome" },
  { id: "trans-5", sourceWord: "arrivederci", targetWord: "goodbye" },
  { id: "trans-6", sourceWord: "amore", targetWord: "love" },
  { id: "trans-7", sourceWord: "acqua", targetWord: "water" },
];

function createGameStartMock(options: {
  startCityId?: string;
  translations?: typeof mockTranslations;
  cities?: typeof mockCities;
  edges?: typeof mockEdges;
} = {}) {
  const {
    startCityId = "venice",
    translations = mockTranslations,
    cities = mockCities,
    edges = mockEdges,
  } = options;

  const startCity = cities.find(c => c.id === startCityId)!;
  const targetCity = cities.find(c => c.id === "rome")!;

  return {
    result: {
      data: {
        journey: mockJourney,
        startCity: { id: startCity.id, name: startCity.displayName },
        targetCity: { id: targetCity.id, name: targetCity.displayName },
        allCities: cities,
        allEdges: edges,
        allTranslations: translations,
      },
    },
  };
}

test.describe("Game Page", () => {
  test.describe("Error States", () => {
    test("shows error screen when journey data fails to load", async ({
      authenticatedPage: page,
    }) => {
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.abort("failed");
      });

      const game = new GamePage(page);
      await game.goto("road-to-rome");

      await expect(game.errorScreen).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole("heading", { name: /connection problem/i })).toBeVisible();
    });

    test("shows error screen when journey is not found", async ({
      authenticatedPage: page,
    }) => {
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      const game = new GamePage(page);
      await game.goto("non-existent-journey");

      await expect(game.errorScreen).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole("heading", { name: /journey not found/i })).toBeVisible();
    });
  });

  test.describe("Idle State", () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [mockJourney] },
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

      await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: null },
          }),
        });
      });
    });

    test("shows game start screen with Begin Journey button", async ({
      authenticatedPage: page,
    }) => {
      const game = new GamePage(page);
      await game.goto("road-to-rome");

      await expect(game.startScreen).toBeVisible();

      await expect(game.beginButton).toBeVisible();
    });

    test("has Back to Dashboard link", async ({ authenticatedPage: page }) => {
      const game = new GamePage(page);
      await game.goto("road-to-rome");

      await expect(game.backLink).toBeVisible();
      await expect(game.backLink).toHaveAttribute("href", /\/dashboard\/?/);
    });
  });

  test.describe("Playing State", () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [mockJourney] },
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

      await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: null },
          }),
        });
      });

      await page.route("**/trpc/game.start**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(createGameStartMock()),
        });
      });
    });

    test("clicking Begin Journey starts the game", async ({
      authenticatedPage: page,
    }) => {
      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      await expect(game.playingLayout).toBeVisible({ timeout: 10000 });
    });

    test("displays translation input with source word", async ({
      authenticatedPage: page,
    }) => {
      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      await expect(game.translationInput).toBeVisible({ timeout: 10000 });

      await expect(game.translationSourceWord).toBeVisible();
    });

    test("shows journey name in header during play", async ({
      authenticatedPage: page,
    }) => {
      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      await expect(page.getByText("Road to Rome")).toBeVisible({ timeout: 10000 });
    });

    test("shows available edge selection buttons", async ({
      authenticatedPage: page,
    }) => {
      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      await expect(game.edgeButton(1)).toBeVisible({ timeout: 10000 });
      await expect(game.edgeButton(2)).toBeVisible();
    });

    test("shows progress indicator in header", async ({
      authenticatedPage: page,
    }) => {
      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      await expect(game.progress).toBeVisible({ timeout: 10000 });
      await expect(game.progress).toContainText("0/5");
    });

    test("has Exit link in header", async ({ authenticatedPage: page }) => {
      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      await expect(game.exitLink).toBeVisible({ timeout: 10000 });
      await expect(game.exitLink).toHaveAttribute("href", /\/dashboard\/?/);
    });
  });

  test.describe("Translation Mechanics", () => {
    test("submitting correct answer advances the game", async ({
      authenticatedPage: page,
    }) => {
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [mockJourney] },
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

      await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: null },
          }),
        });
      });

      await page.route("**/trpc/game.start**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(createGameStartMock({
            translations: [
              { id: "trans-1", sourceWord: "ciao", targetWord: "hello" },
              ...mockTranslations.slice(1),
            ],
          })),
        });
      });

      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      await expect(game.translationInput).toBeVisible({ timeout: 10000 });

      const sourceWordText = await game.translationSourceWord.textContent();
      const sourceWord = sourceWordText?.replace(/^\d+\.\s*/, "").trim();

      const translation = mockTranslations.find(t => t.sourceWord === sourceWord);
      if (translation) {
        await game.submitAnswer(translation.targetWord);
      } else {
        await game.submitAnswer("hello");
      }

      await expect(game.progress).toContainText("1/5", { timeout: 10000 });
    });

    test("submitting wrong answer shows error feedback", async ({
      authenticatedPage: page,
    }) => {
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [mockJourney] },
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

      await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: null },
          }),
        });
      });

      await page.route("**/trpc/game.start**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(createGameStartMock()),
        });
      });

      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      await expect(game.translationInput).toBeVisible({ timeout: 10000 });
      await game.submitAnswer("wrong");

      await expect(page.getByText(/not quite/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Win Screen", () => {
    test("displays win screen with journey-specific message", async ({
      authenticatedPage: page,
    }) => {
      const simpleCities = [
        { id: "florence", name: "florence", displayName: "Florence", position: 0 },
        { id: "rome", name: "rome", displayName: "Rome", position: 1 },
      ];
      const simpleEdges = [
        { id: "edge-final", fromCityId: "florence", toCityId: "rome" },
      ];
      const simpleTranslations = [
        { id: "trans-1", sourceWord: "arrivederci", targetWord: "goodbye" },
      ];

      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [mockJourney] },
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

      await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: null },
          }),
        });
      });

      await page.route("**/trpc/game.saveProgress**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: { success: true } },
          }),
        });
      });

      await page.route("**/trpc/game.start**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: {
                journey: mockJourney,
                startCity: { id: "florence", name: "Florence" },
                targetCity: { id: "rome", name: "Rome" },
                allCities: simpleCities,
                allEdges: simpleEdges,
                allTranslations: simpleTranslations,
              },
            },
          }),
        });
      });

      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      await expect(game.translationInput).toBeVisible({ timeout: 10000 });
      await game.submitAnswer("goodbye");

      await expect(game.winScreen).toBeVisible({ timeout: 10000 });
      await expect(game.winTitle).toContainText(/you made it to rome/i);
    });

    test("Play Again button restarts game", async ({
      authenticatedPage: page,
    }) => {
      const simpleCities = [
        { id: "florence", name: "florence", displayName: "Florence", position: 0 },
        { id: "rome", name: "rome", displayName: "Rome", position: 1 },
      ];
      const simpleEdges = [
        { id: "edge-final", fromCityId: "florence", toCityId: "rome" },
      ];
      const simpleTranslations = [
        { id: "trans-1", sourceWord: "arrivederci", targetWord: "goodbye" },
      ];

      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [mockJourney] },
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

      await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: null },
          }),
        });
      });

      await page.route("**/trpc/game.saveProgress**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: { success: true } },
          }),
        });
      });

      // Mock game.start
      await page.route("**/trpc/game.start**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: {
                journey: mockJourney,
                startCity: { id: "florence", name: "Florence" },
                targetCity: { id: "rome", name: "Rome" },
                allCities: simpleCities,
                allEdges: simpleEdges,
                allTranslations: simpleTranslations,
              },
            },
          }),
        });
      });

      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      // Submit correct answer to win
      await expect(game.translationInput).toBeVisible({ timeout: 10000 });
      await game.submitAnswer("goodbye");

      // Wait for win screen
      await expect(game.playAgainButton).toBeVisible({ timeout: 10000 });

      // Click Play Again
      await game.playAgain();

      // Should show playing state (game restarts)
      await expect(game.playingLayout).toBeVisible({ timeout: 10000 });
    });

    test("Exit to Dashboard link navigates correctly", async ({
      authenticatedPage: page,
    }) => {
      // Create a simple 2-city journey for quick win
      const simpleCities = [
        { id: "florence", name: "florence", displayName: "Florence", position: 0 },
        { id: "rome", name: "rome", displayName: "Rome", position: 1 },
      ];
      const simpleEdges = [
        { id: "edge-final", fromCityId: "florence", toCityId: "rome" },
      ];
      const simpleTranslations = [
        { id: "trans-1", sourceWord: "arrivederci", targetWord: "goodbye" },
      ];

      // Mock listJourneys
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [mockJourney] },
          }),
        });
      });

      // Mock getUserProgress
      await page.route("**/trpc/game.getUserProgress**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      // Mock getJourneyRecord
      await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: null },
          }),
        });
      });

      // Mock saveProgress
      await page.route("**/trpc/game.saveProgress**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: { success: true } },
          }),
        });
      });

      // Mock game.start
      await page.route("**/trpc/game.start**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: {
                journey: mockJourney,
                startCity: { id: "florence", name: "Florence" },
                targetCity: { id: "rome", name: "Rome" },
                allCities: simpleCities,
                allEdges: simpleEdges,
                allTranslations: simpleTranslations,
              },
            },
          }),
        });
      });

      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      // Submit correct answer to win
      await expect(game.translationInput).toBeVisible({ timeout: 10000 });
      await game.submitAnswer("goodbye");

      // Wait for win screen and click Exit to Dashboard
      await expect(game.winExitLink).toBeVisible({ timeout: 10000 });
      await game.winExitLink.click();

      // Should navigate to dashboard
      await expect(page).toHaveURL(/\/dashboard\/?$/);
    });

    test("shows save error warning when progress save fails", async ({
      authenticatedPage: page,
    }) => {
      // Create a simple 2-city journey for quick win
      const simpleCities = [
        { id: "florence", name: "florence", displayName: "Florence", position: 0 },
        { id: "rome", name: "rome", displayName: "Rome", position: 1 },
      ];
      const simpleEdges = [
        { id: "edge-final", fromCityId: "florence", toCityId: "rome" },
      ];
      const simpleTranslations = [
        { id: "trans-1", sourceWord: "arrivederci", targetWord: "goodbye" },
      ];

      // Mock listJourneys
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [mockJourney] },
          }),
        });
      });

      // Mock getUserProgress
      await page.route("**/trpc/game.getUserProgress**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      // Mock getJourneyRecord
      await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: null },
          }),
        });
      });

      // Mock saveProgress to FAIL
      await page.route("**/trpc/game.saveProgress**", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              message: "Failed to save progress",
            },
          }),
        });
      });

      // Mock game.start
      await page.route("**/trpc/game.start**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: {
                journey: mockJourney,
                startCity: { id: "florence", name: "Florence" },
                targetCity: { id: "rome", name: "Rome" },
                allCities: simpleCities,
                allEdges: simpleEdges,
                allTranslations: simpleTranslations,
              },
            },
          }),
        });
      });

      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      // Submit correct answer to win
      await expect(game.translationInput).toBeVisible({ timeout: 10000 });
      await game.submitAnswer("goodbye");

      // Should show win screen with save error warning and retry button
      await expect(game.winScreen).toBeVisible({ timeout: 10000 });
      await expect(game.winSaveError).toBeVisible({ timeout: 5000 });
      await expect(game.winRetrySaveButton).toBeVisible();
    });

    test("retry button saves progress successfully", async ({
      authenticatedPage: page,
    }) => {
      // Create a simple 2-city journey for quick win
      const simpleCities = [
        { id: "florence", name: "florence", displayName: "Florence", position: 0 },
        { id: "rome", name: "rome", displayName: "Rome", position: 1 },
      ];
      const simpleEdges = [
        { id: "edge-final", fromCityId: "florence", toCityId: "rome" },
      ];
      const simpleTranslations = [
        { id: "trans-1", sourceWord: "arrivederci", targetWord: "goodbye" },
      ];

      // Mock listJourneys
      await page.route("**/trpc/game.listJourneys**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [mockJourney] },
          }),
        });
      });

      // Mock getUserProgress
      await page.route("**/trpc/game.getUserProgress**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: [] },
          }),
        });
      });

      // Mock getJourneyRecord
      await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: { data: null },
          }),
        });
      });

      // Mock saveProgress - fail first, then succeed
      let saveAttempts = 0;
      await page.route("**/trpc/game.saveProgress**", async (route) => {
        saveAttempts++;
        if (saveAttempts === 1) {
          // First attempt fails
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({
              error: { message: "Failed to save progress" },
            }),
          });
        } else {
          // Retry succeeds
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              result: { data: { success: true } },
            }),
          });
        }
      });

      // Mock game.start
      await page.route("**/trpc/game.start**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: {
                journey: mockJourney,
                startCity: { id: "florence", name: "Florence" },
                targetCity: { id: "rome", name: "Rome" },
                allCities: simpleCities,
                allEdges: simpleEdges,
                allTranslations: simpleTranslations,
              },
            },
          }),
        });
      });

      const game = new GamePage(page);
      await game.goto("road-to-rome");
      await game.beginJourney();

      await expect(game.translationInput).toBeVisible({ timeout: 10000 });
      await game.submitAnswer("goodbye");

      await expect(game.winScreen).toBeVisible({ timeout: 10000 });
      await expect(game.winSaveError).toBeVisible({ timeout: 5000 });

      await game.winRetrySaveButton.click();

      await expect(game.winSaveSuccess).toBeVisible({ timeout: 5000 });
      await expect(game.winSaveError).not.toBeVisible();
    });
  });
});

test.describe("Multi-Journey Support", () => {
  const mockSpanishJourney = {
    id: "journey-2",
    slug: "camino-de-santiago",
    name: "Camino de Santiago",
    description: "Walk the ancient pilgrim path from Barcelona to Santiago de Compostela!",
    language: "spanish",
    startCityName: "barcelona",
    targetCityName: "santiago",
    emoji: "🐚",
    winMessage: "You Made It to Santiago!",
  };

  const spanishCities = [
    { id: "barcelona", name: "barcelona", displayName: "Barcelona", position: 0 },
    { id: "zaragoza", name: "zaragoza", displayName: "Zaragoza", position: 1 },
    { id: "santiago", name: "santiago", displayName: "Santiago de Compostela", position: 2 },
  ];

  const spanishEdges = [
    { id: "edge-1", fromCityId: "barcelona", toCityId: "zaragoza" },
    { id: "edge-2", fromCityId: "zaragoza", toCityId: "santiago" },
  ];

  const spanishTranslations = [
    { id: "trans-1", sourceWord: "hola", targetWord: "hello" },
    { id: "trans-2", sourceWord: "adiós", targetWord: "goodbye" },
    { id: "trans-3", sourceWord: "gracias", targetWord: "thank you" },
  ];

  test("Spanish journey uses correct start and target cities", async ({
    authenticatedPage: page,
  }) => {
    await page.route("**/trpc/game.listJourneys**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: [mockSpanishJourney] },
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

    await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: null },
        }),
      });
    });

    await page.route("**/trpc/game.start**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: {
              journey: mockSpanishJourney,
              startCity: { id: "barcelona", name: "Barcelona" },
              targetCity: { id: "santiago", name: "Santiago de Compostela" },
              allCities: spanishCities,
              allEdges: spanishEdges,
              allTranslations: spanishTranslations,
            },
          },
        }),
      });
    });

    const game = new GamePage(page);
    await game.goto("camino-de-santiago");
    await game.beginJourney();

    await expect(page.getByText("Barcelona").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Santiago de Compostela").first()).toBeVisible();
    await expect(page.getByText("Camino de Santiago").first()).toBeVisible();
  });

  test("Spanish journey displays Spanish words", async ({
    authenticatedPage: page,
  }) => {
    await page.route("**/trpc/game.listJourneys**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: [mockSpanishJourney] },
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

    await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: null },
        }),
      });
    });

    await page.route("**/trpc/game.start**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: {
              journey: mockSpanishJourney,
              startCity: { id: "barcelona", name: "Barcelona" },
              targetCity: { id: "santiago", name: "Santiago de Compostela" },
              allCities: spanishCities,
              allEdges: spanishEdges,
              allTranslations: spanishTranslations,
            },
          },
        }),
      });
    });

    const game = new GamePage(page);
    await game.goto("camino-de-santiago");
    await game.beginJourney();

    await expect(game.translationSourceWord).toBeVisible({ timeout: 10000 });
  });

  test("Win screen shows journey-specific win message", async ({
    authenticatedPage: page,
  }) => {
    const winCities = [
      { id: "ponferrada", name: "ponferrada", displayName: "Ponferrada", position: 0 },
      { id: "santiago", name: "santiago", displayName: "Santiago de Compostela", position: 1 },
    ];
    const winEdges = [
      { id: "edge-final", fromCityId: "ponferrada", toCityId: "santiago" },
    ];
    const winTranslations = [
      { id: "trans-1", sourceWord: "adiós", targetWord: "goodbye" },
    ];

    await page.route("**/trpc/game.listJourneys**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: [mockSpanishJourney] },
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

    await page.route("**/trpc/game.getJourneyRecord**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: null },
        }),
      });
    });

    await page.route("**/trpc/game.saveProgress**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: { success: true } },
        }),
      });
    });

    await page.route("**/trpc/game.start**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: {
              journey: mockSpanishJourney,
              startCity: { id: "ponferrada", name: "Ponferrada" },
              targetCity: { id: "santiago", name: "Santiago de Compostela" },
              allCities: winCities,
              allEdges: winEdges,
              allTranslations: winTranslations,
            },
          },
        }),
      });
    });

    const game = new GamePage(page);
    await game.goto("camino-de-santiago");
    await game.beginJourney();

    await expect(game.translationInput).toBeVisible({ timeout: 10000 });
    await game.submitAnswer("goodbye");

    await expect(game.winTitle).toContainText(/you made it to santiago/i, { timeout: 10000 });
  });
});
