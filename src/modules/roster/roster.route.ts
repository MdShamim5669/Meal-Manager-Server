import { Router } from "express";
import { RosterController } from "./roster.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireManager } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, RosterController.getRoster);
router.post("/", authenticate, requireManager, RosterController.createDuty);
router.patch("/:id", authenticate, RosterController.updateDuty);

export default router;
