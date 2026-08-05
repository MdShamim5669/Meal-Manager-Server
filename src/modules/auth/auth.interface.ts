import { z } from "zod";
import {
  setupSchema,
  loginSchema,
  changePinSchema,
  forgotPinSchema,
  resetPinSchema,
  adminResetPinSchema,
} from "./auth.validation";
import { Role } from "@prisma/client";

export type SetupInput = z.infer<typeof setupSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type ChangePinInput = z.infer<typeof changePinSchema>["body"];
export type ForgotPinInput = z.infer<typeof forgotPinSchema>["body"];
export type ResetPinInput = z.infer<typeof resetPinSchema>["body"];
export type AdminResetPinInput = z.infer<typeof adminResetPinSchema>["body"];

export type IAuthSetup = SetupInput;
export type IAuthLogin = LoginInput;
export type IChangePin = ChangePinInput;
export type IForgotPin = ForgotPinInput;
export type IResetPin = ResetPinInput;
export type IAdminResetPin = AdminResetPinInput;

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
