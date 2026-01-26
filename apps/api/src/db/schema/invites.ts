import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export const inviteCodes = pgTable("invite_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  createdById: text("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const inviteUses = pgTable("invite_uses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  inviteCodeId: text("invite_code_id")
    .notNull()
    .references(() => inviteCodes.id, { onDelete: "cascade" }),
  usedById: text("used_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  usedAt: timestamp("used_at").notNull().defaultNow(),
});
