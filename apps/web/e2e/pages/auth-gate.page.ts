import type { Locator, Page } from "@playwright/test";

import { BasePage } from "./base.page";

/**
 * Page object for testing AuthGate and AdminGate components.
 * These components show inline login/access-denied screens instead of redirecting.
 */
export class AuthGatePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // AuthPrompt selectors (shown when unauthenticated)
  get signInHeading(): Locator {
    return this.page.getByRole("heading", { name: /sign in to continue/i });
  }

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

  get signUpLink(): Locator {
    // Target the sign up link inside the auth prompt card (not the header)
    return this.page.locator(".bg-white").getByRole("link", { name: /sign up/i });
  }

  // AccessDenied selectors (shown for non-admin users on admin pages)
  get accessDeniedHeading(): Locator {
    return this.page.getByRole("heading", { name: /access denied/i });
  }

  get accessDeniedMessage(): Locator {
    return this.page.getByText(/don't have permission/i);
  }

  get goToDashboardLink(): Locator {
    return this.page.getByRole("link", { name: /go to dashboard/i });
  }

  // Actions
  async login(email: string, password: string): Promise<void> {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginSubmitButton.click();
  }
}
