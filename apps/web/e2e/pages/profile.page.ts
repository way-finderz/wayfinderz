import type { Locator, Page } from "@playwright/test";

import { BasePage } from "./base.page";

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  get name(): Locator {
    return this.getByTestId("profile-name");
  }

  get email(): Locator {
    return this.getByTestId("profile-email");
  }

  get role(): Locator {
    return this.getByTestId("profile-role");
  }

  get memberSince(): Locator {
    return this.getByTestId("profile-member-since");
  }

  get signOutButton(): Locator {
    return this.getByTestId("profile-sign-out");
  }

  // Actions
  async goto(): Promise<void> {
    await this.page.goto("/profile");
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }
}
