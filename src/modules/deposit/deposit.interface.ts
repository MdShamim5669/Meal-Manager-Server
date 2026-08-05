import { z } from "zod";

export const createDepositSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  date: z.string().or(z.date()),
  amount: z.number().positive("Amount must be greater than 0"),
  periodId: z.string().min(1, "Period ID is required"),
});

export type CreateDepositInput = z.infer<typeof createDepositSchema>;
