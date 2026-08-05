import { DutyStatus, PeriodStatus, Role } from "@prisma/client";

export type IMemberDashboardData = {
  role: "MEMBER";
  member: {
    id: string;
    name: string;
  };
  period: {
    id: string;
    label: string;
    startDate: Date;
    endDate: Date;
    status: PeriodStatus;
  };
  myTotalMeals: number;
  myTotalDeposit: number;
  myIndividualCost: number;
  myBalance: number;
  myStatus: "OWED" | "OWES" | "SETTLED";
  messMealRate: number;
  myDutySchedule: Array<{
    id: string;
    date: Date;
    status: DutyStatus;
  }>;
  mySettlements: Array<{
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
    amount: number;
  }>;
};

export type IManagerDashboardData = {
  role: "MANAGER";
  manager: {
    id: string;
    name: string;
  };
  period: {
    id: string;
    label: string;
    startDate: Date;
    endDate: Date;
    status: PeriodStatus;
  };
  summary: {
    totalMeals: number;
    totalExpenses: number;
    totalDeposits: number;
    mealRate: number;
  };
  expenseBreakdown: {
    marketExpense: number;
    utilityExpense: number;
  };
  unsettledDebtorsCount: number;
  unsettledCreditorsCount: number;
  todaysDuty: {
    id: string;
    date: Date;
    status: DutyStatus;
    member: { id: string; name: string };
  } | null;
  memberBalances: Array<{
    memberId: string;
    name: string;
    role: Role;
    totalMeals: number;
    totalDeposit: number;
    individualCost: number;
    balance: number;
    status: "OWED" | "OWES" | "SETTLED";
  }>;
  settlements: Array<{
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
    amount: number;
  }>;
};

export type ISuperAdminDashboardData = {
  role: "SUPER_ADMIN";
  systemStats: {
    totalMembers: number;
    activeMembers: number;
    totalManagers: number;
    totalPeriods: number;
    activePeriodLabel: string | null;
    lifetimeExpenses: number;
    lifetimeMeals: number;
    lifetimeDeposits: number;
  };
  recentMembers: Array<{
    id: string;
    name: string;
    role: Role;
    active: boolean;
    joinedDate: Date;
  }>;
};
