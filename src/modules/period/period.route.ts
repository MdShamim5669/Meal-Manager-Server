import { Router } from "express";
import { PeriodController } from "./period.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireManager } from "../../middlewares/role.middleware";

const router = Router();

router.get("/dashboard", authenticate, PeriodController.getDashboard);
router.get("/", authenticate, PeriodController.getAllPeriods);
router.get("/:id", authenticate, PeriodController.getPeriodById);
router.post("/close", authenticate, requireManager, PeriodController.closePeriod);

export default router;
