import { z } from "zod";
import { upsertMealSchema } from "./meal.validation";

export type IMealFilterRequest = {
  periodId?: string | undefined;
  memberId?: string | undefined;
  date?: string | undefined;
};

export type IMealUpsert = z.infer<typeof upsertMealSchema>["body"];

export type IMealEntry = {
  id: string;
  memberId: string;
  date: Date;
  mealCount: number;
  periodId: string;
  member?: {
    id: string;
    name: string;
  };
};
