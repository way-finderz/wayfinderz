import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";
import { logger } from "@/lib/logger";

import * as schema from "./schema";

const client = postgres(env.DATABASE_URL, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const dbLogger = env.NODE_ENV === "development" ? {
  logQuery: (query: string, params: unknown[]) => {
    logger.debug("Database query", {
      query: query.substring(0, 200),
      paramsCount: params.length,
    });
  },
} : undefined;

export const db = drizzle(client, { schema, logger: dbLogger });
