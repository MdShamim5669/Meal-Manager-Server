import { Response, NextFunction } from "express";
import { DepositService } from "./deposit.service";
import { createDepositSchema } from "./deposit.interface";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export class DepositController {
  static async getDeposits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const periodId = req.query.periodId as string | undefined;
      const deposits = await DepositService.getDepositsByPeriod(periodId);
      res.json(deposits);
    } catch (error) {
      next(error);
    }
  }

  static async createDeposit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = createDepositSchema.parse(req.body);
      const result = await DepositService.createDeposit(parsed);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}
