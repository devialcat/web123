import { Router, type IRouter } from "express";
import { db, bookingsTable } from "@workspace/db";
import { desc, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res) => {
  const all = await db.select().from(bookingsTable);
  const today = new Date().toISOString().slice(0, 10);

  const totalBookings = all.length;
  const pendingBookings = all.filter((b) => b.status === "pending").length;
  const confirmedBookings = all.filter((b) => b.status === "confirmed").length;
  const completedBookings = all.filter((b) => b.status === "completed").length;
  const cancelledBookings = all.filter((b) => b.status === "cancelled").length;
  const upcomingTrips = all.filter(
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      b.startDate >= today,
  ).length;
  const totalRevenueUsd = all
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + Number(b.totalUsd ?? 0), 0);

  const recentRows = await db
    .select()
    .from(bookingsTable)
    .orderBy(desc(bookingsTable.createdAt))
    .limit(5);

  const recentBookings = recentRows.map((r) => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  }));

  const statusBreakdown = [
    { status: "pending", count: pendingBookings },
    { status: "confirmed", count: confirmedBookings },
    { status: "completed", count: completedBookings },
    { status: "cancelled", count: cancelledBookings },
  ];

  res.json({
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    upcomingTrips,
    totalRevenueUsd: Math.round(totalRevenueUsd * 100) / 100,
    recentBookings,
    statusBreakdown,
  });
});

export default router;
