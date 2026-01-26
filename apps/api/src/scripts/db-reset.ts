import { sql } from "drizzle-orm";

import { db } from "@/db";

import { seedAdmin } from "./seed-admin";
import { seedGame } from "./seed-game";

import "dotenv/config";

async function resetDatabase() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║       Database Reset & Seed            ║");
  console.log("╚════════════════════════════════════════╝");

  console.log("\n⚠️  Wiping all data...\n");

  // Get all table names in the public schema
  const tables = await db.execute<{ tablename: string }>(sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `);

  // Disable foreign key checks, truncate all tables, re-enable
  await db.execute(sql`SET session_replication_role = 'replica'`);

  for (const { tablename } of tables) {
    if (tablename.startsWith("drizzle_")) continue; // Skip drizzle migration tables
    console.log(`  Truncating ${tablename}...`);
    await db.execute(sql.raw(`TRUNCATE TABLE "${tablename}" CASCADE`));
  }

  await db.execute(sql`SET session_replication_role = 'origin'`);

  console.log("\n✓ All tables truncated\n");

  // Run seeders
  await seedAdmin();
  await seedGame();

  console.log("\n╔════════════════════════════════════════╗");
  console.log("║    Database reset complete! 🎉         ║");
  console.log("╚════════════════════════════════════════╝");
}

resetDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Database reset failed:", err);
    process.exit(1);
  });
