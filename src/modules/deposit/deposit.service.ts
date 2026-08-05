import { prisma } from "../../config/db";
import { CreateDepositInput } from "./deposit.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";

export class DepositService {
  static async getDepositsByPeriod(periodId?: string) {
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

    return prisma.deposit.findMany({
      where: { periodId: targetPeriodId },
      include: {
        member: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  static async createDeposit(input: CreateDepositInput) {
    const period = await prisma.period.findUnique({
      where: { id: input.periodId },
    });

    if (!period) {
      throw new NotFoundError("Period not found");
    }

    if (period.status === "CLOSED") {
      throw new BadRequestError("Cannot add deposits to a closed period");
    }

    return prisma.deposit.create({
      data: {
        memberId: input.memberId,
        date: new Date(input.date),
        amount: input.amount,
        periodId: input.periodId,
      },
      include: {
        member: { select: { id: true, name: true } },
      },
    });
  }
}
