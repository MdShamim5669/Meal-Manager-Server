import { z } from "zod";

export const createDutySchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  date: z.string().or(z.date()),
  periodId: z.string().min(1, "Period ID is required"),
});

export const updateDutySchema = z.object({
  status: z.enum(["SCHEDULED", "DONE", "MISSED"]).optional(),
  memberId: z.string().optional(),
});

export type CreateDutyInput = z.infer<typeof createDutySchema>;
export type UpdateDutyInput = z.infer<typeof updateDutySchema>;
