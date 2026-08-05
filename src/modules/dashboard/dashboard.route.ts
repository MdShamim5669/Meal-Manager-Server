import { Router } from "express";
import { PeriodController } from "../period/period.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, PeriodController.getDashboard);

export default router;
