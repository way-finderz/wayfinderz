import type { Locator, Page } from "@playwright/test";

import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  get welcomeHeading(): Locator {
    return this.getByTestId("welcome-heading");
  }

  get welcomeSubtitle(): Locator {
    return this.getByTestId("welcome-subtitle");
  }

  get journeyGrid(): Locator {
    return this.getByTestId("journey-grid");
  }

  get loadingState(): Locator {
    return this.getByTestId("dashboard-loading");
  }

  get emptyState(): Locator {
    return this.getByTestId("dashboard-empty");
  }

  get errorState(): Locator {
    return this.getByTestId("dashboard-error");
  }

  get retryButton(): Locator {
    return this.errorState.getByRole("button", { name: /try again/i });
  }

  journeyTile(slug: string): Locator {
    return this.getByTestId(`journey-tile-${slug}`);
  }

  // Actions
  async goto(): Promise<void> {
    await this.page.goto("/dashboard");
  }

  async selectJourney(slug: string): Promise<void> {
    await this.journeyTile(slug).click();
  }
}
