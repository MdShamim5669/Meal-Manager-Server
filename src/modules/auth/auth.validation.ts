import { z } from "zod";

export const setupSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Manager name is required"),
    pin: z.string().min(4, "PIN must be at least 4 digits"),
    periodLabel: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    memberId: z.string().min(1, "Member ID is required"),
    pin: z.string().min(1, "PIN is required"),
  }),
});

export const changePinSchema = z.object({
  body: z.object({
    oldPin: z.string().min(1, "Current PIN is required"),
    newPin: z.string().min(4, "New PIN must be at least 4 digits"),
  }),
});

export const forgotPinSchema = z.object({
  body: z.object({
    memberId: z.string().min(1, "Member ID is required"),
  }),
});

export const resetPinSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, "Reset token is required"),
    newPin: z.string().min(4, "New PIN must be at least 4 digits"),
  }),
});

export const adminResetPinSchema = z.object({
  body: z.object({
    memberId: z.string().min(1, "Member ID is required"),
    newPin: z.string().min(4, "New PIN must be at least 4 digits"),
  }),
});

export const authValidation = {
  setupSchema,
  loginSchema,
  changePinSchema,
  forgotPinSchema,
  resetPinSchema,
  adminResetPinSchema,
};
