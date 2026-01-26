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
  // Set to true to log emails to console instead of sending via SES
  MOCK_EMAILS: process.env.MOCK_EMAILS === "true",

  // AWS configuration (required when MOCK_EMAILS is false)
  AWS_REGION: process.env.AWS_REGION ?? "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_ENDPOINT_URL: process.env.AWS_ENDPOINT_URL, // For LocalStack

  // SES configuration
  SES_FROM_EMAIL: process.env.SES_FROM_EMAIL ?? "Way Finderz <noreply@wayfinderz.com>",

  SQS_EMAIL_QUEUE_URL: process.env.SQS_EMAIL_QUEUE_URL,
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
