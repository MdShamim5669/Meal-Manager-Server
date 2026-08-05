import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireMember, requireManager, requireSuperAdmin } from "../../middlewares/role.middleware";

const router = Router();

// Member Dashboard (ONLY accessible by MEMBER role)
router.get("/member", authenticate, requireMember, DashboardController.getMemberDashboard);

// Manager Dashboard (ONLY accessible by MANAGER role)
router.get("/manager", authenticate, requireManager, DashboardController.getManagerDashboard);

// Super Admin Dashboard (ONLY accessible by SUPER_ADMIN role)
router.get("/super-admin", authenticate, requireSuperAdmin, DashboardController.getSuperAdminDashboard);

export default router;
