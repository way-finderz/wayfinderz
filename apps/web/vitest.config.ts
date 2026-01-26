import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: true,
    // Exclude storybook stories from main test run
    exclude: ["**/node_modules/**", "**/*.stories.tsx", "**/stories/**"],
    projects: [
      // Unit tests project (jsdom environment with MSW)
      {
        extends: true,
        test: {
          name: 'unit',
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["**/node_modules/**", "**/*.stories.tsx", "**/stories/**"],
          setupFiles: ["./src/test/setup.ts"],
        }
      },
      // Storybook tests project (browser environment, no MSW node)
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook')
          })
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium'
            }]
          },
          // Use storybook-specific setup without MSW node
          setupFiles: ['.storybook/vitest.setup.ts']
        }
      }
    ]
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/views": resolve(__dirname, "./src/views"),
      "@/widgets": resolve(__dirname, "./src/widgets"),
      "@/features": resolve(__dirname, "./src/features"),
      "@/entities": resolve(__dirname, "./src/entities"),
      "@/shared": resolve(__dirname, "./src/shared")
    }
  }
});