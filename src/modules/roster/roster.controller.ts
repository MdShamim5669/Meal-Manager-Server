import { Response } from "express";
import { RosterService } from "./roster.service";
import { rosterValidation } from "./roster.validation";
import { rosterFilterableFields } from "./roster.constant";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { prisma } from "../../config/db";
import { catchAsync, sendResponse, pick } from "../../shared";

export class RosterController {
  static getRoster = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const filters = pick(req.query, rosterFilterableFields as any);

    const roster = await RosterService.getRosterByPeriod(filters.periodId as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Duty roster fetched successfully",
      data: roster,
    });
  });

  static createDuty = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = rosterValidation.createDutySchema.parse(req.body);
    const result = await RosterService.createDuty(parsed);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Duty roster entry created successfully",
      data: result,
    });
  });

  static updateDuty = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const existing = await prisma.dutyRoster.findUnique({ where: { id } });

    if (req.user!.role !== "MANAGER" && existing?.memberId !== req.user!.memberId) {
      throw new ForbiddenError("You can only update your own duty roster status");
    }

    const parsed = rosterValidation.updateDutySchema.parse(req.body);
    const result = await RosterService.updateDuty(id, parsed);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Duty roster status updated successfully",
      data: result,
    });
  });
}
