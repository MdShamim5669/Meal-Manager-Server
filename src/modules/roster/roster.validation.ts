import { z } from "zod";

export const createDutySchema = z.object({
  body: z.object({
    memberId: z.string().min(1, "Member ID is required"),
    date: z.string().or(z.date()),
    periodId: z.string().optional(),
  }),
});

export const updateDutySchema = z.object({
  body: z.object({
    status: z.enum(["SCHEDULED", "DONE", "MISSED"]).optional(),
    memberId: z.string().optional(),
  }),
});

export const rosterValidation = {
  createDutySchema,
  updateDutySchema,
};
