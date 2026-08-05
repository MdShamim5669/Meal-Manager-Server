import { prisma } from "../../config/db";
import { UpsertMealInput } from "./meal.interface";
import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";

export class MealService {
  static async getMealsByPeriod(periodId?: string) {
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

    return prisma.mealEntry.findMany({
      where: { periodId: targetPeriodId },
      include: {
        member: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "asc" },
    });
  }

  static async upsertMeal(memberId: string, dateStr: string, input: UpsertMealInput) {
    const period = await prisma.period.findUnique({
      where: { id: input.periodId },
    });

    if (!period) {
      throw new NotFoundError("Period not found");
    }

    if (period.status === "CLOSED") {
      throw new BadRequestError("Cannot modify meals for a closed period");
    }

    const date = new Date(dateStr);

    return prisma.mealEntry.upsert({
      where: {
        memberId_date: {
          memberId,
          date,
        },
      },
      update: {
        mealCount: input.mealCount,
        periodId: input.periodId,
      },
      create: {
        memberId,
        date,
        mealCount: input.mealCount,
        periodId: input.periodId,
      },
    });
  }
}
