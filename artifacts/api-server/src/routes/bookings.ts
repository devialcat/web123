import { Router, type IRouter } from "express";
import { db, bookingsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  CreateBookingBody,
  ListBookingsQueryParams,
  GetBookingParams,
  UpdateBookingStatusParams,
  UpdateBookingStatusBody,
} from "@workspace/api-zod";
import { estimate, type City } from "../lib/pricing";

const router: IRouter = Router();

function serialize(row: typeof bookingsTable.$inferSelect) {
  return {
    ...row,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  };
}

router.get("/bookings", async (req, res) => {
  const parsed = ListBookingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", issues: parsed.error.issues });
    return;
  }
  const { status } = parsed.data;
  const rows = status
    ? await db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.status, status))
        .orderBy(desc(bookingsTable.createdAt))
    : await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/bookings", async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", issues: parsed.error.issues });
    return;
  }
  const data = parsed.data;
  const startDate =
    data.startDate instanceof Date
      ? data.startDate.toISOString().slice(0, 10)
      : String(data.startDate);
  const endDate =
    data.endDate instanceof Date
      ? data.endDate.toISOString().slice(0, 10)
      : String(data.endDate);
  const cities = (data.cities as City[]) ?? [];
  const price = estimate({
    startDate,
    endDate,
    peopleCount: data.peopleCount,
    cities,
  });

  const [row] = await db
    .insert(bookingsTable)
    .values({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      startDate,
      endDate,
      peopleCount: data.peopleCount,
      cities: cities,
      itinerary: data.itinerary as never,
      message: data.message ?? null,
      language: data.language ?? null,
      totalUsd: price.totalUsd,
      status: "pending",
    })
    .returning();

  res.status(201).json(serialize(row));
});

router.get("/bookings/:id", async (req, res) => {
  const parsed = GetBookingParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const rows = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, parsed.data.id))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serialize(rows[0]));
});

router.patch("/bookings/:id/status", async (req, res) => {
  const params = UpdateBookingStatusParams.safeParse(req.params);
  const body = UpdateBookingStatusBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [row] = await db
    .update(bookingsTable)
    .set({ status: body.data.status })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serialize(row));
});

export default router;
