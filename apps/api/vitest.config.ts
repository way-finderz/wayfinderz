import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.integration.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/test/**/*"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/db": resolve(__dirname, "./src/db"),
      "@/middleware": resolve(__dirname, "./src/middleware"),
      "@/routes": resolve(__dirname, "./src/routes"),
      "@/services": resolve(__dirname, "./src/services"),
      "@/test": resolve(__dirname, "./src/test"),
    }
  }
});
