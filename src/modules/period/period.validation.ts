import { z } from "zod";

export const closePeriodSchema = z.object({
  periodId: z.string().min(1, "Period ID is required"),
  nextPeriodLabel: z.string().min(1, "Next period label is required"),
});

export const periodValidation = {
  closePeriodSchema,
};
