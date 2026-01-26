import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { users } from "./users";

export const journeys = pgTable("journeys", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  language: text("language").notNull(),
  startCityName: text("start_city_name").notNull(),
  targetCityName: text("target_city_name").notNull(),
  emoji: text("emoji").default("🗺️"),
  winMessage: text("win_message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const translations = pgTable("translations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  journeyId: text("journey_id")
    .notNull()
    .references(() => journeys.id, { onDelete: "cascade" }),
  sourceWord: text("source_word").notNull(),
  targetWord: text("target_word").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cities = pgTable("cities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  journeyId: text("journey_id")
    .notNull()
    .references(() => journeys.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const edges = pgTable("edges", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fromCityId: text("from_city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "cascade" }),
  toCityId: text("to_city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const journeyProgress = pgTable(
  "journey_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    journeyId: text("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    completed: boolean("completed").notNull().default(false),
    bestTimeMs: integer("best_time_ms"),
    lastCompletedAt: timestamp("last_completed_at"),
    completionCount: integer("completion_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.journeyId)]
);

export const journeysRelations = relations(journeys, ({ many }) => ({
  cities: many(cities),
  translations: many(translations),
  progress: many(journeyProgress),
}));

export const citiesRelations = relations(cities, ({ one, many }) => ({
  journey: one(journeys, {
    fields: [cities.journeyId],
    references: [journeys.id],
  }),
  edgesFrom: many(edges, { relationName: "fromCity" }),
  edgesTo: many(edges, { relationName: "toCity" }),
}));

export const translationsRelations = relations(translations, ({ one }) => ({
  journey: one(journeys, {
    fields: [translations.journeyId],
    references: [journeys.id],
  }),
}));

export const edgesRelations = relations(edges, ({ one }) => ({
  fromCity: one(cities, {
    fields: [edges.fromCityId],
    references: [cities.id],
    relationName: "fromCity",
  }),
  toCity: one(cities, {
    fields: [edges.toCityId],
    references: [cities.id],
    relationName: "toCity",
  }),
}));

export const journeyProgressRelations = relations(journeyProgress, ({ one }) => ({
  user: one(users, {
    fields: [journeyProgress.userId],
    references: [users.id],
  }),
  journey: one(journeys, {
    fields: [journeyProgress.journeyId],
    references: [journeys.id],
  }),
}));
