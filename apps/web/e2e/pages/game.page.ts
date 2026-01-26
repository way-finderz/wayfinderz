import type { Locator, Page } from "@playwright/test";

import { BasePage } from "./base.page";

export class GamePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Start Screen Selectors
  get startScreen(): Locator {
    return this.getByTestId("game-start-screen");
  }

  get beginButton(): Locator {
    return this.getByTestId("game-begin-button");
  }

  get backLink(): Locator {
    return this.getByTestId("game-back-link");
  }

  // Playing Layout Selectors
  get playingLayout(): Locator {
    return this.getByTestId("game-playing-layout");
  }

  get progress(): Locator {
    return this.getByTestId("game-progress");
  }

  get exitLink(): Locator {
    return this.getByTestId("game-exit-link");
  }

  // Translation Input Selectors
  get translationSourceWord(): Locator {
    return this.getByTestId("translation-source-word");
  }

  get translationInput(): Locator {
    return this.getByTestId("translation-input");
  }

  get translationSubmit(): Locator {
    return this.getByTestId("translation-submit");
  }

  edgeButton(n: number): Locator {
    return this.getByTestId(`edge-button-${n}`);
  }

  // Win Screen Selectors
  get winScreen(): Locator {
    return this.getByTestId("win-screen");
  }

  get winTitle(): Locator {
    return this.getByTestId("win-title");
  }

  get playAgainButton(): Locator {
    return this.getByTestId("win-play-again");
  }

  get winExitLink(): Locator {
    return this.getByTestId("win-exit-link");
  }

  get winSaveError(): Locator {
    return this.page.getByText(/Not saved/i);
  }

  get winRetrySaveButton(): Locator {
    return this.page.getByText(/Retry/i);
  }

  get winSaveSuccess(): Locator {
    return this.page.getByText(/✓ Saved/i);
  }

  get winSaving(): Locator {
    return this.page.getByText(/saving your progress/i);
  }

  // Error Screen Selectors
  get errorScreen(): Locator {
    return this.getByTestId("game-error-screen");
  }

  get errorRetryButton(): Locator {
    return this.errorScreen.getByRole("button", { name: /try again/i });
  }

  // Actions
  async goto(journeySlug: string): Promise<void> {
    await this.page.goto(`/game/${journeySlug}`);
  }

  async beginJourney(): Promise<void> {
    await this.beginButton.waitFor({ state: "visible", timeout: 15000 });
    await this.beginButton.click();
  }

  async submitAnswer(answer: string): Promise<void> {
    await this.translationInput.waitFor({ state: "visible", timeout: 10000 });
    await this.translationInput.fill(answer);
    await this.translationSubmit.click();
  }

  async playAgain(): Promise<void> {
    await this.playAgainButton.waitFor({ state: "visible", timeout: 10000 });
    await this.playAgainButton.click();
  }
}
