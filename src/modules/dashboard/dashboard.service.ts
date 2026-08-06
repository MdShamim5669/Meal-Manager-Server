import { prisma } from "../../config/db";
import {
  IMemberDashboardData,
  IManagerDashboardData,
  ISuperAdminDashboardData,
} from "./dashboard.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { PeriodService } from "../period/period.service";

const getMemberDashboard = async (
  memberId: string,
  periodId?: string
): Promise<IMemberDashboardData> => {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true, name: true },
  });

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  let targetPeriod = periodId
    ? await prisma.period.findUnique({ where: { id: periodId } })
    : await prisma.period.findFirst({ where: { status: "ACTIVE" } });

  if (!targetPeriod) {
    throw new NotFoundError("Active period not found");
  }

  const [meals, expenses, deposits] = await Promise.all([
    prisma.mealEntry.findMany({ where: { periodId: targetPeriod.id } }),
    prisma.expense.findMany({ where: { periodId: targetPeriod.id } }),
    prisma.deposit.findMany({ where: { periodId: targetPeriod.id } }),
  ]);

  const totalMeals = meals.reduce((sum, m) => sum + m.mealCount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const mealRate = totalMeals > 0 ? Math.round((totalExpenses / totalMeals) * 100) / 100 : 0;

  const myTotalMeals = meals
    .filter((m) => m.memberId === memberId)
    .reduce((sum, m) => sum + m.mealCount, 0);

  const myTotalDeposit = deposits
    .filter((d) => d.memberId === memberId)
    .reduce((sum, d) => sum + d.amount, 0);

  const myIndividualCost = Math.round(myTotalMeals * mealRate * 100) / 100;
  const myBalance = Math.round((myTotalDeposit - myIndividualCost) * 100) / 100;

  let myStatus: "OWED" | "OWES" | "SETTLED" = "SETTLED";
  if (myBalance > 0.01) myStatus = "OWED";
  else if (myBalance < -0.01) myStatus = "OWES";

  const myDutySchedule = await prisma.dutyRoster.findMany({
    where: { periodId: targetPeriod.id, memberId },
    select: { id: true, date: true, status: true },
    orderBy: { date: "asc" },
  });

  const members = await prisma.member.findMany({
    where: { active: true, role: { not: "SUPER_ADMIN" } },
    select: { id: true, name: true, role: true },
  });

  const memberBalances = members.map((m) => {
    const mMeals = meals.filter((x) => x.memberId === m.id).reduce((s, x) => s + x.mealCount, 0);
    const mDeposit = deposits.filter((x) => x.memberId === m.id).reduce((s, x) => s + x.amount, 0);
    const cost = Math.round(mMeals * mealRate * 100) / 100;
    const bal = Math.round((mDeposit - cost) * 100) / 100;
    return { memberId: m.id, name: m.name, balance: bal };
  });

  const settlements = PeriodService.computeSettlements(memberBalances);
  const mySettlements = settlements.filter(
    (s) => s.fromId === memberId || s.toId === memberId
  );

  return {
    role: "MEMBER",
    member: { id: member.id, name: member.name },
    period: targetPeriod,
    myTotalMeals,
    myTotalDeposit,
    myIndividualCost,
    myBalance,
    myStatus,
    messMealRate: mealRate,
    myDutySchedule,
    mySettlements,
  };
};

const getManagerDashboard = async (
  managerId: string,
  periodId?: string
): Promise<IManagerDashboardData> => {
  const manager = await prisma.member.findUnique({
    where: { id: managerId },
    select: { id: true, name: true },
  });

  if (!manager) {
    throw new NotFoundError("Manager not found");
  }

  let targetPeriod = periodId
    ? await prisma.period.findUnique({ where: { id: periodId } })
    : await prisma.period.findFirst({ where: { status: "ACTIVE" } });

  if (!targetPeriod) {
    throw new NotFoundError("Active period not found");
  }

  const members = await prisma.member.findMany({
    where: { active: true, role: { not: "SUPER_ADMIN" } },
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

  const memberBalances = members.map((m) => {
    const mTotalMeals = meals.filter((x) => x.memberId === m.id).reduce((s, x) => s + x.mealCount, 0);
    const mDeposit = deposits.filter((x) => x.memberId === m.id).reduce((s, x) => s + x.amount, 0);
    const individualCost = Math.round(mTotalMeals * mealRate * 100) / 100;
    const balance = Math.round((mDeposit - individualCost) * 100) / 100;

    let status: "OWED" | "OWES" | "SETTLED" = "SETTLED";
    if (balance > 0.01) status = "OWED";
    else if (balance < -0.01) status = "OWES";

    return {
      memberId: m.id,
      name: m.name,
      role: m.role,
      totalMeals: mTotalMeals,
      totalDeposit: mDeposit,
      individualCost,
      balance,
      status,
    };
  });

  const settlements = PeriodService.computeSettlements(memberBalances);

  const marketExpense = expenses
    .filter((e) => e.category === "MARKET")
    .reduce((sum, e) => sum + e.amount, 0);
  const utilityExpense = expenses
    .filter((e) => e.category === "UTILITY")
    .reduce((sum, e) => sum + e.amount, 0);

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

  return {
    role: "MANAGER",
    manager: { id: manager.id, name: manager.name },
    period: targetPeriod,
    summary: {
      totalMeals,
      totalExpenses,
      totalDeposits,
      mealRate,
    },
    expenseBreakdown: {
      marketExpense,
      utilityExpense,
    },
    unsettledDebtorsCount: memberBalances.filter((b) => b.status === "OWES").length,
    unsettledCreditorsCount: memberBalances.filter((b) => b.status === "OWED").length,
    todaysDuty,
    memberBalances,
    settlements,
  };
};

const getSuperAdminDashboard = async (): Promise<ISuperAdminDashboardData> => {
  const [
    totalMembers,
    activeMembers,
    totalManagers,
    totalPeriods,
    activePeriod,
    allExpenses,
    allMeals,
    allDeposits,
    recentMembers,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { active: true } }),
    prisma.member.count({ where: { role: "MANAGER" } }),
    prisma.period.count(),
    prisma.period.findFirst({ where: { status: "ACTIVE" } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.mealEntry.aggregate({ _sum: { mealCount: true } }),
    prisma.deposit.aggregate({ _sum: { amount: true } }),
    prisma.member.findMany({
      take: 10,
      orderBy: { joinedDate: "desc" },
      select: {
        id: true,
        name: true,
        role: true,
        active: true,
        joinedDate: true,
      },
    }),
  ]);

  return {
    role: "SUPER_ADMIN",
    systemStats: {
      totalMembers,
      activeMembers,
      totalManagers,
      totalPeriods,
      activePeriodLabel: activePeriod?.label || null,
      lifetimeExpenses: allExpenses._sum.amount || 0,
      lifetimeMeals: allMeals._sum.mealCount || 0,
      lifetimeDeposits: allDeposits._sum.amount || 0,
    },
    recentMembers,
  };
};

export const DashboardService = {
  getMemberDashboard,
  getManagerDashboard,
  getSuperAdminDashboard,
};
