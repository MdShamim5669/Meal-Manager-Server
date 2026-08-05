import { z } from "zod";
import { closePeriodSchema } from "./period.validation";
import { PeriodStatus, Role } from "@prisma/client";

export type ClosePeriodInput = z.infer<typeof closePeriodSchema>;

export interface IClosePeriodPayload extends ClosePeriodInput {}

export interface IDebtSettlementTransferPayload {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface IMemberBalancePayload {
  memberId: string;
  name: string;
  role: Role;
  totalMeals: number;
  totalDeposit: number;
  individualCost: number;
  balance: number;
}

export interface IDashboardResponsePayload {
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
  memberBalances: IMemberBalancePayload[];
  settlements: IDebtSettlementTransferPayload[];
  todaysDuty: unknown;
}
