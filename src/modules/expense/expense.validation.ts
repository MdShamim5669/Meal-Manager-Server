import { z } from "zod";

export const createExpenseSchema = z.object({
  body: z.object({
    date: z.string().or(z.date()).optional(),
    category: z.enum(["MARKET", "UTILITY"]),
    amount: z.number().positive("Amount must be greater than 0"),
    paidBy: z.string().min(1, "PaidBy member ID is required").optional(),
    description: z.string().optional(),
    receiptPhoto: z.string().optional(),
    periodId: z.string().min(1, "Period ID is required").optional(),
  }),
});

export const updateExpenseSchema = z.object({
  body: z.object({
    date: z.string().or(z.date()).optional(),
    category: z.enum(["MARKET", "UTILITY"]).optional(),
    amount: z.number().positive("Amount must be greater than 0").optional(),
    paidBy: z.string().optional(),
    description: z.string().optional(),
    receiptPhoto: z.string().optional(),
    periodId: z.string().optional(),
  }),
});

export const expenseValidation = {
  createExpenseSchema,
  updateExpenseSchema,
};
