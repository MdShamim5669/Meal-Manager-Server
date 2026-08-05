import { prisma } from "../../config/db";
import { ICreateDutyPayload, IUpdateDutyPayload, IDutyRosterResponsePayload } from "./roster.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { DutyStatus } from "@prisma/client";

export class RosterService {
  static async getRosterByPeriod(periodId?: string): Promise<IDutyRosterResponsePayload[]> {
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

  static async createDuty(payload: ICreateDutyPayload): Promise<IDutyRosterResponsePayload> {
    return prisma.dutyRoster.create({
      data: {
        memberId: payload.memberId,
        date: new Date(payload.date),
        periodId: payload.periodId,
        status: "SCHEDULED",
      },
      include: {
        member: { select: { id: true, name: true } },
      },
    });
  }

  static async updateDuty(id: string, payload: IUpdateDutyPayload): Promise<IDutyRosterResponsePayload> {
    const existing = await prisma.dutyRoster.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Duty roster entry not found");
    }

    let doneAt = existing.doneAt;
    if (payload.status === "DONE" && existing.status !== "DONE") {
      doneAt = new Date();
    } else if (payload.status && payload.status !== "DONE") {
      doneAt = null;
    }

    return prisma.dutyRoster.update({
      where: { id },
      data: {
        ...(payload.status && { status: payload.status as DutyStatus }),
        ...(payload.memberId && { memberId: payload.memberId }),
        doneAt,
      },
      include: {
        member: { select: { id: true, name: true } },
      },
    });
  }
}
