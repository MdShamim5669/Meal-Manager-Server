import { z } from "zod";

export const getDashboardSchema = z.object({
  query: z.object({
    periodId: z.string().uuid("Invalid Period ID format").optional(),
  }),
});

export const dashboardValidation = {
  getDashboardSchema,
};
