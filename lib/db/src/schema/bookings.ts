import { pgTable, text, integer, jsonb, doublePrecision, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export type ItineraryStop = { locationId: string; order: number };
export type ItineraryDay = { day: number; stops: ItineraryStop[] };

export const bookingsTable = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  peopleCount: integer("people_count").notNull(),
  cities: jsonb("cities").notNull().$type<string[]>(),
  itinerary: jsonb("itinerary").notNull().$type<ItineraryDay[]>(),
  message: text("message"),
  language: text("language"),
  totalUsd: doublePrecision("total_usd").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BookingRow = typeof bookingsTable.$inferSelect;
export type NewBookingRow = typeof bookingsTable.$inferInsert;
