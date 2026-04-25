import { pgTable, text, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";

export const locationsTable = pgTable("locations", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  city: text("city").notNull(),
  category: text("category").notNull(),
  nameEn: text("name_en").notNull(),
  nameVi: text("name_vi").notNull(),
  nameKo: text("name_ko").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionVi: text("description_vi").notNull(),
  descriptionKo: text("description_ko").notNull(),
  imageUrl: text("image_url").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  featured: boolean("featured").notNull().default(false),
  durationMinutes: integer("duration_minutes").notNull().default(60),
});

export type LocationRow = typeof locationsTable.$inferSelect;
export type NewLocationRow = typeof locationsTable.$inferInsert;
