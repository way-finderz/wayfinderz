import { afterAll, beforeEach } from "vitest";

import { db } from "@/db";
import { inviteCodes, inviteUses } from "@/db/schema";

import "dotenv/config";

// Skip integration tests if no database URL is set
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, integration tests will be skipped");
}

// Clean up test data before each test
beforeEach(async () => {
  // Delete in order to respect foreign key constraints
  await db.delete(inviteUses);
  await db.delete(inviteCodes);
});

// Final cleanup after all tests
afterAll(async () => {
  await db.delete(inviteUses);
  await db.delete(inviteCodes);
});
