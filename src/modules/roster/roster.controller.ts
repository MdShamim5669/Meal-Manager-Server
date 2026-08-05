import { Response, NextFunction } from "express";
import { RosterService } from "./roster.service";
import { createDutySchema, updateDutySchema } from "./roster.interface";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { prisma } from "../../config/db";

export class RosterController {
  static async getRoster(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const periodId = req.query.periodId as string | undefined;
      const roster = await RosterService.getRosterByPeriod(periodId);
      res.json(roster);
    } catch (error) {
      next(error);
    }
  }

  static async createDuty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = createDutySchema.parse(req.body);
      const result = await RosterService.createDuty(parsed);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateDuty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const existing = await prisma.dutyRoster.findUnique({ where: { id } });

      if (req.user!.role !== "MANAGER" && existing?.memberId !== req.user!.memberId) {
        throw new ForbiddenError("You can only update your own duty roster status");
      }

      const parsed = updateDutySchema.parse(req.body);
      const result = await RosterService.updateDuty(id, parsed);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
