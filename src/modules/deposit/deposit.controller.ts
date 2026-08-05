import { Response } from "express";
import { DepositService } from "./deposit.service";
import { depositValidation } from "./deposit.validation";
import { depositFilterableFields } from "./deposit.constant";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { catchAsync, sendResponse, pick } from "../../shared";

export class DepositController {
  static getDeposits = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const filters = pick(req.query, depositFilterableFields as any);

    const deposits = await DepositService.getDepositsByPeriod(filters.periodId as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Deposits fetched successfully",
      data: deposits,
    });
  });

  static createDeposit = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const result = await DepositService.createDeposit(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Deposit record created successfully",
      data: result,
    });
  });
}
