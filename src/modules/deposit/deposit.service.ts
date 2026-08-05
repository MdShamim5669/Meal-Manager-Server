import { prisma } from "../../config/db";
import { ICreateDepositPayload, IDepositResponsePayload } from "./deposit.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";

const getDepositsByPeriod = async (periodId?: string): Promise<IDepositResponsePayload[]> => {
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
};

const createDeposit = async (payload: ICreateDepositPayload): Promise<IDepositResponsePayload> => {
  const period = await prisma.period.findUnique({
    where: { id: payload.periodId },
  });

  if (!period) {
    throw new NotFoundError("Period not found");
  }

  if (period.status === "CLOSED") {
    throw new BadRequestError("Cannot add deposits to a closed period");
  }

  return prisma.deposit.create({
    data: {
      memberId: payload.memberId,
      date: new Date(payload.date),
      amount: payload.amount,
      periodId: payload.periodId,
    },
    include: {
      member: { select: { id: true, name: true } },
    },
  });
};

export const DepositService = {
  getDepositsByPeriod,
  createDeposit,
};
