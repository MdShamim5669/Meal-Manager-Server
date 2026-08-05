import { Response } from "express";
import { DashboardService } from "./dashboard.service";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { catchAsync, sendResponse } from "../../shared";

const getMemberDashboard = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const periodId = req.query.periodId as string | undefined;
  const result = await DashboardService.getMemberDashboard(req.user!.memberId, periodId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Member dashboard fetched successfully",
    data: result,
  });
});

const getManagerDashboard = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const periodId = req.query.periodId as string | undefined;
  const result = await DashboardService.getManagerDashboard(req.user!.memberId, periodId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Manager dashboard fetched successfully",
    data: result,
  });
});

const getSuperAdminDashboard = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
  const result = await DashboardService.getSuperAdminDashboard();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Super Admin dashboard fetched successfully",
    data: result,
  });
});

export const DashboardController = {
  getMemberDashboard,
  getManagerDashboard,
  getSuperAdminDashboard,
};
