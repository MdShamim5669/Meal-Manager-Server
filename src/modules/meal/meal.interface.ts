import { z } from "zod";
import { upsertMealSchema } from "./meal.validation";

export type UpsertMealInput = z.infer<typeof upsertMealSchema>;

export interface IUpsertMealPayload extends UpsertMealInput {}

export interface IMealEntryResponsePayload {
  id: string;
  memberId: string;
  date: Date;
  mealCount: number;
  periodId: string;
  member?: {
    id: string;
    name: string;
  };
}
