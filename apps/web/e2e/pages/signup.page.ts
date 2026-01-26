import type { Locator, Page } from "@playwright/test";

import { BasePage } from "./base.page";

export class SignupPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  get inviteCodeInput(): Locator {
    return this.getByTestId("invite-code-input");
  }

  get validateButton(): Locator {
    return this.getByTestId("invite-code-validate");
  }

  get validBadge(): Locator {
    return this.getByTestId("invite-code-valid-badge");
  }

  // Actions
  async goto(code?: string): Promise<void> {
    const url = code ? `/signup?code=${code}` : "/signup";
    await this.page.goto(url);
  }

  async enterInviteCode(code: string): Promise<void> {
    await this.inviteCodeInput.fill(code);
  }

  async validateCode(): Promise<void> {
    await this.validateButton.click();
  }
}
