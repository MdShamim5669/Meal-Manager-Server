import { z } from "zod";

export const createExpenseSchema = z.object({
  date: z.string().or(z.date()),
  category: z.enum(["MARKET", "UTILITY"]),
  amount: z.number().positive("Amount must be greater than 0"),
  paidBy: z.string().min(1, "PaidBy member ID is required"),
  description: z.string().optional(),
  receiptPhoto: z.string().optional(),
  periodId: z.string().min(1, "Period ID is required"),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
