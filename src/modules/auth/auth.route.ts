import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/setup", AuthController.setup);
router.post("/login", AuthController.login);
router.get("/me", authenticate, AuthController.getMe);

export default router;
