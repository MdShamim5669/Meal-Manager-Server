import { Router } from "express";
import { DepositController } from "./deposit.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireManager } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, DepositController.getDeposits);
router.post("/", authenticate, requireManager, DepositController.createDeposit);

export default router;
