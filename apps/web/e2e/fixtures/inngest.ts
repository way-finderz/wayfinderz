import { type ChildProcess, spawn } from "node:child_process";

const INNGEST_DEV_PORT = 8288;
const INNGEST_API_URL = `http://localhost:${INNGEST_DEV_PORT}`;
const API_URL = "http://localhost:3000";

let inngestProcess: ChildProcess | null = null;

async function waitForUrl(
  url: string,
  maxAttempts = 60,
  interval = 500
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) {
        return true;
      }
    } catch (_) {
      void 0;
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  return false;
}

export async function isInngestRunning(): Promise<boolean> {
  return waitForUrl(INNGEST_API_URL, 1, 100);
}

export async function startInngestDevServer(): Promise<void> {
  if (inngestProcess) {
    return;
  }

  const isRunning = await isInngestRunning();
  if (isRunning) {
    return;
  }

  inngestProcess = spawn(
    "pnpm",
    [
      "dlx",
      "inngest-cli@latest",
      "dev",
      "-u",
      `${API_URL}/api/inngest`,
      "--no-discovery",
    ],
    {
      cwd: process.cwd().replace("/apps/web", "/apps/api"),
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    }
  );

  inngestProcess.on("exit", () => {
    inngestProcess = null;
  });

  const isReady = await waitForUrl(INNGEST_API_URL, 60, 500);
  if (!isReady) {
    throw new Error("Inngest dev server failed to start within timeout");
  }
}

export async function stopInngestDevServer(): Promise<void> {
  if (!inngestProcess) {
    return;
  }

  return new Promise((resolve) => {
    if (!inngestProcess) {
      resolve();

      return;
    }

    const timeout = setTimeout(() => {
      if (inngestProcess) {
        inngestProcess.kill("SIGKILL");
      }
    }, 5000);

    inngestProcess.on("exit", () => {
      clearTimeout(timeout);
      inngestProcess = null;
      resolve();
    });

    inngestProcess.kill("SIGTERM");
  });
}

export async function getInngestEvents(): Promise<InngestEvent[]> {
  try {
    const response = await fetch(`${INNGEST_API_URL}/v1/events`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();

    return data.data || [];
  } catch {
    return [];
  }
}

export async function waitForInngestEvent(
  eventName: string,
  options: {
    timeout?: number;
    pollInterval?: number;
    afterTimestamp?: number;
    dataMatch?: Record<string, unknown>;
  } = {}
): Promise<InngestEvent | null> {
  const {
    timeout = 10000,
    pollInterval = 500,
    afterTimestamp = 0,
    dataMatch,
  } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const events = await getInngestEvents();
    const matchingEvent = events.find((e) => {
      if (e.name !== eventName) return false;
      if (afterTimestamp && e.ts < afterTimestamp) return false;
      if (dataMatch) {
        for (const [key, value] of Object.entries(dataMatch)) {
          if (e.data[key] !== value) return false;
        }
      }

      return true;
    });

    if (matchingEvent) {
      return matchingEvent;
    }

    await new Promise((r) => setTimeout(r, pollInterval));
  }

  return null;
}

export interface InngestEvent {
  id: string;
  name: string;
  data: Record<string, unknown>;
  ts: number;
  internal_id?: string;
}

export interface RecordedEmail {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  subject: string;
  templateName?: string;
  templateProps?: Record<string, unknown>;
}

export async function enableEmailRecording(): Promise<void> {
  const response = await fetch(`${API_URL}/api/test/emails/enable`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to enable email recording: ${response.status}`);
  }
}

export async function disableEmailRecording(): Promise<void> {
  const response = await fetch(`${API_URL}/api/test/emails/disable`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to disable email recording: ${response.status}`);
  }
}

export async function getRecordedEmails(): Promise<RecordedEmail[]> {
  const response = await fetch(`${API_URL}/api/test/emails`);
  if (!response.ok) {
    throw new Error(`Failed to get recorded emails: ${response.status}`);
  }
  const data = await response.json();

  return data.emails || [];
}

export async function clearRecordedEmails(): Promise<void> {
  const response = await fetch(`${API_URL}/api/test/emails`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to clear recorded emails: ${response.status}`);
  }
}

export async function findRecordedEmailsByRecipient(
  to: string
): Promise<RecordedEmail[]> {
  const url = `${API_URL}/api/test/emails/find?to=${encodeURIComponent(to)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to find emails: ${response.status}`);
  }
  const data = await response.json();

  return data.emails || [];
}

export async function waitForRecordedEmail(
  options: {
    to?: string;
    subject?: string;
    timeout?: number;
    pollInterval?: number;
    afterTimestamp?: number;
  } = {}
): Promise<RecordedEmail | null> {
  const {
    to,
    subject,
    timeout = 10000,
    pollInterval = 500,
    afterTimestamp = 0,
  } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const emails = await getRecordedEmails();
    const matchingEmail = emails.find((e) => {
      if (to && e.to !== to) return false;
      if (subject) {
        const lowerSubject = subject.toLowerCase();
        if (!e.subject.toLowerCase().includes(lowerSubject)) return false;
      }
      if (afterTimestamp && e.timestamp < afterTimestamp) return false;

      return true;
    });

    if (matchingEmail) {
      return matchingEmail;
    }

    await new Promise((r) => setTimeout(r, pollInterval));
  }

  return null;
}
