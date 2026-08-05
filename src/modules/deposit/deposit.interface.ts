import { z } from "zod";
import { createDepositSchema } from "./deposit.validation";

export type CreateDepositInput = z.infer<typeof createDepositSchema>;

export interface ICreateDepositPayload extends CreateDepositInput {}

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
