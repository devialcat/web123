import { Router, type IRouter } from "express";
import { EstimatePriceBody } from "@workspace/api-zod";
import { estimate, RATE_CARD, type City } from "../lib/pricing";

const router: IRouter = Router();

router.post("/pricing/estimate", (req, res) => {
  const parsed = EstimatePriceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", issues: parsed.error.issues });
    return;
  }
  const data = parsed.data;
  const result = estimate({
    startDate:
      data.startDate instanceof Date
        ? data.startDate.toISOString().slice(0, 10)
        : String(data.startDate),
    endDate:
      data.endDate instanceof Date
        ? data.endDate.toISOString().slice(0, 10)
        : String(data.endDate),
    peopleCount: data.peopleCount,
    cities: data.cities as City[],
  });
  res.json(result);
});

router.get("/pricing/rates", (_req, res) => {
  res.json(RATE_CARD);
});

export default router;
