import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { inviteCodes, users } from "@/db/schema";

import "dotenv/config";

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Set ${key} in your .env file before running the seed script.`
    );
  }

  return value;
}

const ADMIN_EMAIL = getRequiredEnv("ADMIN_EMAIL");
const ADMIN_PASSWORD = getRequiredEnv("ADMIN_PASSWORD");
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

if (ADMIN_PASSWORD.length < 12) {
  throw new Error(
    "ADMIN_PASSWORD must be at least 12 characters long for security."
  );
}

export async function seedAdmin() {
  console.log("\n=== Seeding admin user ===");

  // Check if admin user already exists
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, ADMIN_EMAIL),
  });

  if (existingAdmin) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);

    if (existingAdmin.role !== "admin") {
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, existingAdmin.id));
      console.log(`Updated user role to admin`);
    }
  } else {
    const ctx = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
    });

    if (ctx.user) {
      await db
        .update(users)
        .set({ role: "admin", emailVerified: true })
        .where(eq(users.id, ctx.user.id));

      console.log(`Created admin user: ${ADMIN_EMAIL}`);
    } else {
      console.error("Failed to create admin user");
    }
  }

  const existingCodes = await db.query.inviteCodes.findMany();

  if (existingCodes.length === 0) {
    // Use a fixed code for development (matches allowed charset: no I, O, 0, 1)
    const code = "WELC2ME3";

    const adminUser = await db.query.users.findFirst({
      where: eq(users.email, ADMIN_EMAIL),
    });

    await db.insert(inviteCodes).values({
      code,
      createdById: adminUser?.id ?? null,
      isActive: true,
    });

    console.log(`Created initial invite code: ${code}`);
    console.log("IMPORTANT: Save this code - it will not be shown again!");
  } else {
    console.log(`Found ${existingCodes.length} existing invite codes`);
  }

  console.log("Admin seeding complete!");
}

// Allow running directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Admin seeding failed:", err);
      process.exit(1);
    });
}
