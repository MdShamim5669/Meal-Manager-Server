import { Response } from "express";
import { PeriodService } from "./period.service";
import { periodValidation } from "./period.validation";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { catchAsync, sendResponse } from "../../shared";

export class PeriodController {
  static getDashboard = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const periodId = req.query.periodId as string | undefined;
    const user = {
      memberId: req.user!.memberId,
      role: req.user!.role,
    };

    const dashboardData = await PeriodService.getDashboardData(user, periodId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  });

  static getAllPeriods = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
    const periods = await PeriodService.getAllPeriods();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All period history fetched successfully",
      data: periods,
    });
  });

  static getPeriodById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const period = await PeriodService.getPeriodById(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Period details fetched successfully",
      data: period,
    });
  });

  static closePeriod = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = periodValidation.closePeriodSchema.parse(req.body);
    const result = await PeriodService.closePeriod(parsed);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Period closed and new period created successfully",
      data: result,
    });
  });
}
