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
  let targetPeriodId = payload.periodId;
  if (!targetPeriodId) {
    const activePeriod = await prisma.period.findFirst({
      where: { status: "ACTIVE" },
    });
    if (!activePeriod) {
      throw new NotFoundError("No active period found");
    }
    targetPeriodId = activePeriod.id;
  }

  const period = await prisma.period.findUnique({
    where: { id: targetPeriodId },
  });

  if (!period) {
    throw new NotFoundError("Period not found");
  }

  if (period.status === "CLOSED") {
    throw new BadRequestError("Cannot add deposits to a closed period");
  }

  const depositDate = payload.date ? new Date(payload.date) : new Date();
  if (isNaN(depositDate.getTime())) {
    throw new BadRequestError("Invalid date format provided");
  }

  return prisma.deposit.create({
    data: {
      memberId: payload.memberId,
      date: depositDate,
      amount: payload.amount,
      periodId: targetPeriodId,
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
