import { z } from "zod";

export const createDepositSchema = z.object({
  body: z.object({
    memberId: z.string().min(1, "Member ID is required"),
    date: z.string().or(z.date()).optional(),
    amount: z.number().positive("Amount must be greater than 0"),
    periodId: z.string().min(1, "Period ID is required").optional(),
  }),
});

export const depositValidation = {
  createDepositSchema,
};
