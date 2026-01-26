import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      // API server
      command: "cd ../api && pnpm dev",
      url: "http://localhost:3000/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      // Web server
      command: "pnpm dev",
      url: "http://localhost:3001",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
