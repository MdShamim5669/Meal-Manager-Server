import { Router } from "express";
import { DepositController } from "./deposit.controller";
import { depositValidation } from "./deposit.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireManager } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, DepositController.getDeposits);
router.post(
  "/",
  authenticate,
  requireManager,
  validateRequest(depositValidation.createDepositSchema),
  DepositController.createDeposit
);

export default router;
