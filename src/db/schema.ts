import { pgTable, serial, varchar, decimal, date } from "drizzle-orm/pg-core";

export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  priceCzk: decimal("price_czk", { precision: 10, scale: 2 }).notNull(),
  continent: varchar("continent", { length: 50 }).notNull(),
  createdAt: date("created_at").defaultNow(),
});

export const schema = {
  prices,
};
