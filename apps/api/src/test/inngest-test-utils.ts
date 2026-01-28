import { type ChildProcess,spawn } from "node:child_process";
import http from "node:http";

let inngestProcess: ChildProcess | null = null;

const INNGEST_DEV_PORT = 8288;
const INNGEST_API_URL = `http://localhost:${INNGEST_DEV_PORT}`;

/**
 * Wait for a URL to become available
 */
async function waitForUrl(
  url: string,
  maxAttempts = 30,
  interval = 500
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
            resolve();
          } else {
            reject(new Error(`Status: ${res.statusCode}`));
          }
        });
        req.on("error", reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error("Timeout"));
        });
      });

      return true;
    } catch {
      await new Promise((r) => setTimeout(r, interval));
    }
  }

  return false;
}

/**
 * Start the Inngest dev server for integration testing
 */
export async function startInngestDevServer(apiUrl: string): Promise<void> {
  if (inngestProcess) {
    console.log("Inngest dev server already running");

    return;
  }

  console.log("Starting Inngest dev server...");

  inngestProcess = spawn("pnpm", ["dlx", "inngest-cli@latest", "dev", "-u", apiUrl, "--no-discovery"], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
    env: {
      ...process.env,
      // Ensure the dev server doesn't try to poll other apps
      INNGEST_DEV_NO_POLL: "1",
    },
  });

  // Log output for debugging
  inngestProcess.stdout?.on("data", (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(`[Inngest] ${output}`);
    }
  });

  inngestProcess.stderr?.on("data", (data) => {
    const output = data.toString().trim();
    if (output) {
      console.error(`[Inngest Error] ${output}`);
    }
  });

  inngestProcess.on("error", (err) => {
    console.error("Failed to start Inngest dev server:", err);
  });

  inngestProcess.on("exit", (code) => {
    console.log(`Inngest dev server exited with code ${code}`);
    inngestProcess = null;
  });

  // Wait for the Inngest dev server to be ready
  const isReady = await waitForUrl(INNGEST_API_URL, 60, 500);
  if (!isReady) {
    await stopInngestDevServer();
    throw new Error("Inngest dev server failed to start within timeout");
  }

  console.log("Inngest dev server is ready");
}

/**
 * Stop the Inngest dev server
 */
export async function stopInngestDevServer(): Promise<void> {
  if (!inngestProcess) {
    return;
  }

  console.log("Stopping Inngest dev server...");

  return new Promise((resolve) => {
    if (!inngestProcess) {
      resolve();

      return;
    }

    inngestProcess.on("exit", () => {
      inngestProcess = null;
      resolve();
    });

    inngestProcess.kill("SIGTERM");

    // Force kill after 5 seconds if it doesn't exit gracefully
    setTimeout(() => {
      if (inngestProcess) {
        inngestProcess.kill("SIGKILL");
      }
    }, 5000);
  });
}

/**
 * Get the Inngest dev server URL
 */
export function getInngestDevUrl(): string {
  return INNGEST_API_URL;
}

/**
 * Check if the Inngest dev server is running
 */
export async function isInngestDevServerRunning(): Promise<boolean> {
  return waitForUrl(INNGEST_API_URL, 1, 100);
}

/**
 * Trigger a function run via the Inngest dev server API
 */
export async function triggerInngestFunction(
  eventName: string,
  eventData: Record<string, unknown>
): Promise<{ ids: string[] }> {
  const response = await fetch(`${INNGEST_API_URL}/e/${eventName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: eventName,
      data: eventData,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to trigger Inngest function: ${response.status} ${text}`);
  }

  return response.json();
}

/**
 * Wait for an Inngest function run to complete
 */
export async function waitForFunctionRun(
  runId: string,
  maxAttempts = 30,
  interval = 500
): Promise<{ status: string; output?: unknown }> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${INNGEST_API_URL}/v1/runs/${runId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === "Completed" || data.status === "Failed" || data.status === "Cancelled") {
          return data;
        }
      }
    } catch {
      // Ignore errors, keep retrying
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`Function run ${runId} did not complete within timeout`);
}
