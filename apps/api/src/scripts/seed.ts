import { seedAdmin } from "./seed-admin";
import { seedGame } from "./seed-game";

import "dotenv/config";

async function seed() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     Road to Rome - Database Seeder     ║");
  console.log("╚════════════════════════════════════════╝");

  // Run seeders in order
  // Admin must run first as it creates the admin user needed for invite codes
  await seedAdmin();
  await seedGame();

  console.log("\n╔════════════════════════════════════════╗");
  console.log("║       All seeding complete! 🎉         ║");
  console.log("╚════════════════════════════════════════╝");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Seeding failed:", err);
    process.exit(1);
  });
