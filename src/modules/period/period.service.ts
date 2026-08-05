import { prisma } from "../../config/db";
import {
  IClosePeriodPayload,
  IDebtSettlementTransfer,
  IMemberBalance,
  IDashboardResponse,
  IPersonalDashboard,
  IManagerDashboardExtra,
} from "./period.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";
import { Role } from "@prisma/client";

export class PeriodService {
  static computeSettlements(
    balances: { memberId: string; name: string; balance: number }[]
  ): IDebtSettlementTransfer[] {
    const debtors = balances
      .filter((b) => b.balance < -0.01)
      .map((b) => ({ ...b, amount: Math.abs(b.balance) }))
      .sort((a, b) => b.amount - a.amount);

    const creditors = balances
      .filter((b) => b.balance > 0.01)
      .map((b) => ({ ...b, amount: b.balance }))
      .sort((a, b) => b.amount - a.amount);

    const transfers: IDebtSettlementTransfer[] = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const settlement = Math.min(debtor.amount, creditor.amount);

      if (settlement > 0) {
        transfers.push({
          fromId: debtor.memberId,
          fromName: debtor.name,
          toId: creditor.memberId,
          toName: creditor.name,
          amount: Math.round(settlement * 100) / 100,
        });
      }

      debtor.amount -= settlement;
      creditor.amount -= settlement;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return transfers;
  }

  static async getDashboardData(
    user: { memberId: string; role: Role },
    periodId?: string
  ): Promise<IDashboardResponse> {
    let targetPeriod: { id: string; label: string; startDate: Date; endDate: Date; status: "ACTIVE" | "CLOSED" } | null =
      null;

    if (periodId) {
      targetPeriod = await prisma.period.findUnique({ where: { id: periodId } });
    } else {
      targetPeriod = await prisma.period.findFirst({ where: { status: "ACTIVE" } });
    }

    if (!targetPeriod) {
      throw new NotFoundError("Period not found");
    }

    const members = await prisma.member.findMany({
      where: { active: true },
      select: { id: true, name: true, role: true },
    });

    const [meals, expenses, deposits] = await Promise.all([
      prisma.mealEntry.findMany({ where: { periodId: targetPeriod.id } }),
      prisma.expense.findMany({ where: { periodId: targetPeriod.id } }),
      prisma.deposit.findMany({ where: { periodId: targetPeriod.id } }),
    ]);

    const totalMeals = meals.reduce((sum, m) => sum + m.mealCount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);

    const mealRate = totalMeals > 0 ? Math.round((totalExpenses / totalMeals) * 100) / 100 : 0;

    const memberBalances: IMemberBalance[] = members.map((member) => {
      const memberTotalMeals = meals
        .filter((m) => m.memberId === member.id)
        .reduce((sum, m) => sum + m.mealCount, 0);

      const memberDeposit = deposits
        .filter((d) => d.memberId === member.id)
        .reduce((sum, d) => sum + d.amount, 0);

      const individualCost = Math.round(memberTotalMeals * mealRate * 100) / 100;
      const balance = Math.round((memberDeposit - individualCost) * 100) / 100;

      let status: "OWED" | "OWES" | "SETTLED" = "SETTLED";
      if (balance > 0.01) status = "OWED";
      else if (balance < -0.01) status = "OWES";

      return {
        memberId: member.id,
        name: member.name,
        role: member.role,
        totalMeals: memberTotalMeals,
        totalDeposit: memberDeposit,
        individualCost,
        balance,
        status,
      };
    });

    const settlements = this.computeSettlements(memberBalances);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysDuty = await prisma.dutyRoster.findFirst({
      where: {
        periodId: targetPeriod.id,
        date: { gte: today, lt: tomorrow },
      },
      include: { member: { select: { id: true, name: true } } },
    });

    const myBalanceObj = memberBalances.find((b) => b.memberId === user.memberId);
    const myDutySchedule = await prisma.dutyRoster.findMany({
      where: {
        periodId: targetPeriod.id,
        memberId: user.memberId,
      },
      select: {
        id: true,
        date: true,
        status: true,
      },
      orderBy: { date: "asc" },
    });

    const mySettlements = settlements.filter(
      (s) => s.fromId === user.memberId || s.toId === user.memberId
    );

    const personalSummary: IPersonalDashboard = {
      myTotalMeals: myBalanceObj?.totalMeals || 0,
      myTotalDeposit: myBalanceObj?.totalDeposit || 0,
      myIndividualCost: myBalanceObj?.individualCost || 0,
      myBalance: myBalanceObj?.balance || 0,
      myStatus: myBalanceObj?.status || "SETTLED",
      myDutySchedule,
      mySettlements,
    };

    const marketExpense = expenses
      .filter((e) => e.category === "MARKET")
      .reduce((sum, e) => sum + e.amount, 0);
    const utilityExpense = expenses
      .filter((e) => e.category === "UTILITY")
      .reduce((sum, e) => sum + e.amount, 0);

    const managerMetrics: IManagerDashboardExtra = {
      expenseCategoryBreakdown: {
        marketExpense,
        utilityExpense,
      },
      unsettledDebtorsCount: memberBalances.filter((b) => b.status === "OWES").length,
      unsettledCreditorsCount: memberBalances.filter((b) => b.status === "OWED").length,
    };

    return {
      role: user.role,
      period: targetPeriod,
      summary: {
        totalMeals,
        totalExpenses,
        totalDeposits,
        mealRate,
      },
      memberBalances,
      settlements,
      todaysDuty,
      personalSummary,
      ...(user.role === "MANAGER" && { managerMetrics }),
    };
  }

  static async getAllPeriods() {
    return prisma.period.findMany({
      orderBy: { startDate: "desc" },
    });
  }

  static async getPeriodById(id: string) {
    const period = await prisma.period.findUnique({ where: { id } });
    if (!period) {
      throw new NotFoundError("Period not found");
    }
    return period;
  }

  static async closePeriod(payload: IClosePeriodPayload) {
    return prisma.$transaction(async (tx) => {
      const period = await tx.period.findUnique({
        where: { id: payload.periodId },
      });

      if (!period) {
        throw new NotFoundError("Period to close was not found");
      }

      if (period.status === "CLOSED") {
        throw new BadRequestError("Period is already closed");
      }

      const [meals, expenses] = await Promise.all([
        tx.mealEntry.findMany({ where: { periodId: period.id } }),
        tx.expense.findMany({ where: { periodId: period.id } }),
      ]);

      const totalMeals = meals.reduce((sum, m) => sum + m.mealCount, 0);
      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
      const mealRate = totalMeals > 0 ? Math.round((totalExpense / totalMeals) * 100) / 100 : 0;

      await tx.period.update({
        where: { id: period.id },
        data: {
          status: "CLOSED",
          totalMeals,
          totalExpense,
          mealRate,
        },
      });

      const nextStartDate = new Date(period.endDate);
      nextStartDate.setDate(nextStartDate.getDate() + 1);

      const nextEndDate = new Date(nextStartDate.getFullYear(), nextStartDate.getMonth() + 1, 0);

      const newPeriod = await tx.period.create({
        data: {
          label: payload.nextPeriodLabel,
          startDate: nextStartDate,
          endDate: nextEndDate,
          status: "ACTIVE",
        },
      });

      return {
        closedPeriodId: period.id,
        newPeriod,
      };
    });
  }
}
