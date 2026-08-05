import { Router } from "express";
import { RosterController } from "./roster.controller";
import { rosterValidation } from "./roster.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireManager } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, RosterController.getRoster);
router.post(
  "/",
  authenticate,
  requireManager,
  validateRequest(rosterValidation.createDutySchema),
  RosterController.createDuty
);
router.patch(
  "/:id",
  authenticate,
  validateRequest(rosterValidation.updateDutySchema),
  RosterController.updateDuty
);

export default router;
