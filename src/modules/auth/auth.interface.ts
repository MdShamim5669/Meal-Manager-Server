import { z } from "zod";
import { setupSchema, loginSchema } from "./auth.validation";
import { Role } from "@prisma/client";

export type SetupInput = z.infer<typeof setupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface ISetupPayload extends SetupInput {}
export interface ILoginPayload extends LoginInput {}

export interface IAuthResponse {
  token: string;
  member: {
    id: string;
    name: string;
    role: Role;
  };
}

export interface ICurrentMemberPayload {
  id: string;
  name: string;
  role: Role;
  active: boolean;
  joinedDate: Date;
}
