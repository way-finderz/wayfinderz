function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!url && process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required in production. " +
      "Please set this environment variable to your API server URL."
    );
  }

  return url || "http://localhost:3000";
}

export const env = {
  API_URL: getApiUrl(),
} as const;
