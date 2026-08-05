import { z } from "zod";
import { createDepositSchema } from "./deposit.validation";

export type CreateDepositInput = z.infer<typeof createDepositSchema>["body"];

export type ICreateDepositPayload = {
  memberId: string;
  date?: string | Date | undefined;
  amount: number;
  periodId?: string | undefined;
};

export interface IDepositResponsePayload {
  id: string;
  memberId: string;
  date: Date;
  amount: number;
  periodId: string;
  member?: {
    id: string;
    name: string;
  };
}
