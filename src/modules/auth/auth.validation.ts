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

export const authValidation = {
  setupSchema,
  loginSchema,
};
