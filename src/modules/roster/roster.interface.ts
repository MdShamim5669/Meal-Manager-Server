import { z } from "zod";
import { createDutySchema, updateDutySchema } from "./roster.validation";
import { DutyStatus } from "@prisma/client";

export type CreateDutyInput = z.infer<typeof createDutySchema>;
export type UpdateDutyInput = z.infer<typeof updateDutySchema>;

export interface ICreateDutyPayload extends CreateDutyInput {}
export interface IUpdateDutyPayload extends UpdateDutyInput {}

export interface IDutyRosterResponsePayload {
  id: string;
  memberId: string;
  date: Date;
  status: DutyStatus;
  doneAt: Date | null;
  periodId: string;
  member?: {
    id: string;
    name: string;
  };
}
