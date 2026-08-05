import { z } from "zod";
import { createDutySchema, updateDutySchema } from "./roster.validation";
import { DutyStatus } from "@prisma/client";

export type CreateDutyInput = z.infer<typeof createDutySchema>["body"];
export type UpdateDutyInput = z.infer<typeof updateDutySchema>["body"];

export type ICreateDutyPayload = CreateDutyInput;
export type IUpdateDutyPayload = UpdateDutyInput;

export type IRosterFilterRequest = {
  periodId?: string | undefined;
  memberId?: string | undefined;
  status?: DutyStatus | undefined;
};

export type IDutyRosterResponsePayload = {
  id: string;
  memberId: string;
  date: Date;
  periodId: string;
  status: DutyStatus;
  member?: {
    id: string;
    name: string;
  };
};
