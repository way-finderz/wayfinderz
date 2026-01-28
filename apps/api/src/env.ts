import "dotenv/config";

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env = {
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  API_PORT: parseInt(getEnvVar("API_PORT", "3000"), 10),
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  BETTER_AUTH_SECRET: getEnvVar("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: getEnvVar("BETTER_AUTH_URL", "http://localhost:3000"),
  FRONTEND_URL: getEnvVar("FRONTEND_URL", "http://localhost:3001"),
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS, // Optional comma-separated list

  // Email configuration
  // Set to true to log emails to console instead of sending via Resend
  MOCK_EMAILS: process.env.MOCK_EMAILS === "true",

  // Resend configuration (required when MOCK_EMAILS is false)
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM ?? "Way Finderz <noreply@way-finderz.com>",

  // Inngest configuration
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  LOG_PRETTY: process.env.LOG_PRETTY === "true",
} as const;

// Critical: Prevent MOCK_EMAILS from being enabled in production
// This would silently discard all verification and password reset emails
if (env.NODE_ENV === "production" && env.MOCK_EMAILS) {
  throw new Error(
    "CRITICAL: MOCK_EMAILS cannot be enabled in production. " +
    "This would silently discard all user emails (verification, password reset). " +
    "Remove MOCK_EMAILS=true from your production environment."
  );
}
