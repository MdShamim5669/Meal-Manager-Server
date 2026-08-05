import { z } from "zod";

export const upsertMealSchema = z.object({
  mealCount: z.number().min(0, "Meal count must be non-negative"),
  periodId: z.string().min(1, "Period ID is required"),
});

export const mealValidation = {
  upsertMealSchema,
};
