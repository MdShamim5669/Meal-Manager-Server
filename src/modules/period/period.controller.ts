import { Response, NextFunction } from "express";
import { PeriodService } from "./period.service";
import { periodValidation } from "./period.validation";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export class PeriodController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const periodId = req.query.periodId as string | undefined;
      const user = {
        memberId: req.user!.memberId,
        role: req.user!.role,
      };

      const dashboardData = await PeriodService.getDashboardData(user, periodId);
      res.json(dashboardData);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPeriods(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const periods = await PeriodService.getAllPeriods();
      res.json(periods);
    } catch (error) {
      next(error);
    }
  }

  static async getPeriodById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const period = await PeriodService.getPeriodById(id);
      res.json(period);
    } catch (error) {
      next(error);
    }
  }

  static async closePeriod(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = periodValidation.closePeriodSchema.parse(req.body);
      const result = await PeriodService.closePeriod(parsed);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
