/* global console */
import { build } from "esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseConfig = {
  platform: "node",
  target: "node22",
  format: "esm",
  bundle: true,
  minify: false, // Disable minification to help debug
  sourcemap: true,
  packages: "external", // Keep ALL npm packages external
  alias: {
    "@/*": resolve(__dirname, "src/*"),
    // Explicitly resolve workspace packages to bundle them
    "@way-finderz/shared": resolve(__dirname, "../../packages/shared/src/index.ts"),
  },
  tsconfig: "tsconfig.json"
};

// Build main API server
await build({
  ...baseConfig,
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
});

// Build email worker
await build({
  ...baseConfig,
  entryPoints: ["src/workers/email-worker.ts"],
  outfile: "dist/workers/email-worker.js",
});

console.log("✓ Build completed successfully");