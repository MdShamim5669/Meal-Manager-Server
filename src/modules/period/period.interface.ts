import { z } from "zod";
import { closePeriodSchema } from "./period.validation";
import { PeriodStatus, Role } from "@prisma/client";

export type ClosePeriodInput = z.infer<typeof closePeriodSchema>["body"];
export type IClosePeriodPayload = ClosePeriodInput;

export type IDebtSettlementTransfer = {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
};

export type IMemberBalance = {
  memberId: string;
  name: string;
  role: Role;
  totalMeals: number;
  totalDeposit: number;
  individualCost: number;
  balance: number;
  status: "OWED" | "OWES" | "SETTLED";
};

export type IPersonalDashboard = {
  myTotalMeals: number;
  myTotalDeposit: number;
  myIndividualCost: number;
  myBalance: number;
  myStatus: "OWED" | "OWES" | "SETTLED";
  myDutySchedule: Array<{
    id: string;
    date: Date;
    status: string;
  }>;
  mySettlements: IDebtSettlementTransfer[];
};

export type IManagerDashboardExtra = {
  expenseCategoryBreakdown: {
    marketExpense: number;
    utilityExpense: number;
  };
  unsettledDebtorsCount: number;
  unsettledCreditorsCount: number;
};

export type IDashboardResponse = {
  role: Role;
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
  memberBalances: IMemberBalance[];
  settlements: IDebtSettlementTransfer[];
  todaysDuty: {
    id: string;
    memberId: string;
    date: Date;
    status: string;
    member: { id: string; name: string };
  } | null;
  personalSummary?: IPersonalDashboard | undefined;
  managerMetrics?: IManagerDashboardExtra | undefined;
};
