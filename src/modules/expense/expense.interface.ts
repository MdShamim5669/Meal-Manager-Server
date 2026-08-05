import { z } from "zod";
import { createExpenseSchema, updateExpenseSchema } from "./expense.validation";
import { ExpenseCategory } from "@prisma/client";

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export interface ICreateExpensePayload extends CreateExpenseInput {}
export interface IUpdateExpensePayload extends UpdateExpenseInput {}

export interface IExpenseResponsePayload {
  id: string;
  date: Date;
  category: ExpenseCategory;
  amount: number;
  paidBy: string;
  description: string | null;
  receiptPhoto: string | null;
  periodId: string;
  member?: {
    id: string;
    name: string;
  };
}
