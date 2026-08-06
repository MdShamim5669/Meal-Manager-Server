import { prisma } from "../../config/db";
import { IMealUpsert, IMealEntry, IMealFilterRequest } from "./meal.interface";
import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";

const getMealsByPeriod = async (filters?: IMealFilterRequest): Promise<IMealEntry[]> => {
  let targetPeriodId = filters?.periodId;

  if (!targetPeriodId) {
    const activePeriod = await prisma.period.findFirst({
      where: { status: "ACTIVE" },
    });
    if (!activePeriod) {
      throw new NotFoundError("No active period found");
    }
    targetPeriodId = activePeriod.id;
  }

  return prisma.mealEntry.findMany({
    where: {
      periodId: targetPeriodId,
      ...(filters?.memberId && { memberId: filters.memberId }),
    },
    include: {
      member: {
        select: { id: true, name: true },
      },
    },
    orderBy: { date: "asc" },
  });
};

const upsertMeal = async (
  memberId: string,
  dateStr: string,
  payload: IMealUpsert
): Promise<IMealEntry> => {
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
    throw new BadRequestError("Cannot modify meals for a closed period");
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new BadRequestError("Invalid date format provided");
  }

  return prisma.mealEntry.upsert({
    where: {
      memberId_date: {
        memberId,
        date,
      },
    },
    update: {
      mealCount: payload.mealCount,
      periodId: targetPeriodId,
    },
    create: {
      memberId,
      date,
      mealCount: payload.mealCount,
      periodId: targetPeriodId,
    },
  });
};

export const MealService = {
  getMealsByPeriod,
  upsertMeal,
};
