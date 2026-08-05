import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/setup", validateRequest(authValidation.setupSchema), AuthController.setup);
router.post("/login", validateRequest(authValidation.loginSchema), AuthController.login);
router.get("/me", authenticate, AuthController.getMe);

export default router;
