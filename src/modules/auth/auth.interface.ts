import { z } from "zod";
import { setupSchema, loginSchema } from "./auth.validation";
import { Role } from "@prisma/client";

export type SetupInput = z.infer<typeof setupSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];

export type IAuthSetup = SetupInput;
export type IAuthLogin = LoginInput;

export type IAuthResponse = {
  token: string;
  member: {
    id: string;
    name: string;
    role: Role;
  };
};

export type ICurrentMember = {
  id: string;
  name: string;
  role: Role;
  active: boolean;
  joinedDate: Date;
};
