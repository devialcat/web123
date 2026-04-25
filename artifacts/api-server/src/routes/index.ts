import { Router, type IRouter } from "express";
import healthRouter from "./health";
import locationsRouter from "./locations";
import pricingRouter from "./pricing";
import bookingsRouter from "./bookings";
import reviewsRouter from "./reviews";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(locationsRouter);
router.use(pricingRouter);
router.use(bookingsRouter);
router.use(reviewsRouter);
router.use(statsRouter);

export default router;
