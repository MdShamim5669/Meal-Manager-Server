import { Router } from "express";
import { MemberController } from "./member.controller";
import { memberValidation } from "./member.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireManager } from "../../middlewares/role.middleware";
import { cacheMiddleware } from "../../utils/cache.util";

const router = Router();

router.get("/", authenticate, cacheMiddleware(120), MemberController.getAllMembers);
router.post("/search", authenticate, MemberController.searchMember);
router.post("/placeholder", authenticate, requireManager, MemberController.createPlaceholder);
router.post("/", authenticate, requireManager, validateRequest(memberValidation.createMemberSchema), MemberController.createMember);
router.patch("/:id", authenticate, requireManager, validateRequest(memberValidation.updateMemberSchema), MemberController.updateMember);

export default router;
