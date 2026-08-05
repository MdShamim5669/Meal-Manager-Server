import { Router } from "express";
import { Role } from "@prisma/client";
import { AuthController } from "./auth.controller";
import { authValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles, requireManager } from "../../middlewares/role.middleware";
import { authLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.post("/setup", authLimiter, validateRequest(authValidation.setupSchema), AuthController.setup);
router.post("/login", authLimiter, validateRequest(authValidation.loginSchema), AuthController.login);
router.get("/me", authenticate, AuthController.getMe);

router.post(
  "/change-pin",
  authenticate,
  authLimiter,
  validateRequest(authValidation.changePinSchema),
  AuthController.changePin
);

router.post(
  "/forgot-password",
  authLimiter,
  validateRequest(authValidation.forgotPinSchema),
  AuthController.forgotPin
);
router.post(
  "/forgot-pin",
  authLimiter,
  validateRequest(authValidation.forgotPinSchema),
  AuthController.forgotPin
);

router.post(
  "/reset-password",
  authLimiter,
  validateRequest(authValidation.resetPinSchema),
  AuthController.resetPin
);
router.post(
  "/reset-pin",
  authLimiter,
  validateRequest(authValidation.resetPinSchema),
  AuthController.resetPin
);

router.post(
  "/admin-reset-pin",
  authenticate,
  requireManager,
  authLimiter,
  validateRequest(authValidation.adminResetPinSchema),
  AuthController.adminResetPin
);

export default router;
