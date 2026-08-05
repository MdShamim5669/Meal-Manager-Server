import { Router } from "express";
import { MemberController } from "./member.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireManager } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, MemberController.getAllMembers);
router.post("/", authenticate, requireManager, MemberController.createMember);
router.patch("/:id", authenticate, requireManager, MemberController.updateMember);

export default router;
