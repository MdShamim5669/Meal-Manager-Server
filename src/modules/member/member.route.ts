import { Router } from "express";
import { MemberController } from "./member.controller";
import { memberValidation } from "./member.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireManager } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, MemberController.getAllMembers);
router.post("/", authenticate, requireManager, validateRequest(memberValidation.createMemberSchema), MemberController.createMember);
router.patch("/:id", authenticate, requireManager, validateRequest(memberValidation.updateMemberSchema), MemberController.updateMember);

export default router;
