import { z } from "zod";
import { createMemberSchema, updateMemberSchema } from "./member.validation";
import { Role } from "@prisma/client";

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export interface ICreateMemberPayload extends CreateMemberInput {}
export interface IUpdateMemberPayload extends UpdateMemberInput {}

export interface IMemberResponsePayload {
  id: string;
  name: string;
  role: Role;
  active: boolean;
  joinedDate: Date;
}
