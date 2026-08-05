import { Response, NextFunction } from "express";
import { PeriodService } from "./period.service";
import { closePeriodSchema } from "./period.interface";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export class PeriodController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const periodId = req.query.periodId as string | undefined;
      const dashboardData = await PeriodService.getDashboardData(periodId);
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
      const parsed = closePeriodSchema.parse(req.body);
      const result = await PeriodService.closePeriod(parsed);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
