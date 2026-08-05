import { prisma } from "../../config/db";
import { CreateDutyInput, UpdateDutyInput } from "./roster.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { DutyStatus } from "@prisma/client";

export class RosterService {
  static async getRosterByPeriod(periodId?: string) {
    let targetPeriodId = periodId;

    if (!targetPeriodId) {
      const activePeriod = await prisma.period.findFirst({
        where: { status: "ACTIVE" },
      });
      if (!activePeriod) {
        throw new NotFoundError("No active period found");
      }
      targetPeriodId = activePeriod.id;
    }

    return prisma.dutyRoster.findMany({
      where: { periodId: targetPeriodId },
      include: {
        member: { select: { id: true, name: true } },
      },
      orderBy: { date: "asc" },
    });
  }

  static async createDuty(input: CreateDutyInput) {
    return prisma.dutyRoster.create({
      data: {
        memberId: input.memberId,
        date: new Date(input.date),
        periodId: input.periodId,
        status: "SCHEDULED",
      },
      include: {
        member: { select: { id: true, name: true } },
      },
    });
  }

  static async updateDuty(id: string, input: UpdateDutyInput) {
    const existing = await prisma.dutyRoster.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Duty roster entry not found");
    }

    let doneAt = existing.doneAt;
    if (input.status === "DONE" && existing.status !== "DONE") {
      doneAt = new Date();
    } else if (input.status && input.status !== "DONE") {
      doneAt = null;
    }

    return prisma.dutyRoster.update({
      where: { id },
      data: {
        ...(input.status && { status: input.status as DutyStatus }),
        ...(input.memberId && { memberId: input.memberId }),
        doneAt,
      },
      include: {
        member: { select: { id: true, name: true } },
      },
    });
  }
}
