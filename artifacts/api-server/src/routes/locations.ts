import { Router, type IRouter } from "express";
import { db, locationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListLocationsQueryParams,
  GetLocationParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/locations", async (req, res) => {
  const parsed = ListLocationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", issues: parsed.error.issues });
    return;
  }
  const { city } = parsed.data;
  const rows = city
    ? await db.select().from(locationsTable).where(eq(locationsTable.city, city))
    : await db.select().from(locationsTable);
  res.json(rows);
});

router.get("/locations/featured", async (_req, res) => {
  const rows = await db
    .select()
    .from(locationsTable)
    .where(eq(locationsTable.featured, true));
  res.json(rows);
});

router.get("/locations/:id", async (req, res) => {
  const parsed = GetLocationParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const rows = await db
    .select()
    .from(locationsTable)
    .where(eq(locationsTable.id, parsed.data.id))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(rows[0]);
});

export default router;
