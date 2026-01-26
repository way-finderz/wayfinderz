import type { Locator, Page } from "@playwright/test";

import { BasePage } from "./base.page";

export class LandingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors - Login Form
  get loginEmailInput(): Locator {
    return this.getByTestId("login-email");
  }

  get loginPasswordInput(): Locator {
    return this.getByTestId("login-password");
  }

  get loginSubmitButton(): Locator {
    return this.getByTestId("login-submit");
  }

  get loginError(): Locator {
    return this.getByTestId("login-error");
  }

  // Selectors - Quick Register Form
  get quickRegisterInput(): Locator {
    return this.getByTestId("quick-register-input");
  }

  get quickRegisterSubmit(): Locator {
    return this.getByTestId("quick-register-submit");
  }

  get quickRegisterError(): Locator {
    return this.getByTestId("quick-register-error");
  }

  // Actions
  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginSubmitButton.click();
  }

  async submitQuickRegister(code: string): Promise<void> {
    await this.quickRegisterInput.fill(code);
    await this.quickRegisterSubmit.click();
  }
}
