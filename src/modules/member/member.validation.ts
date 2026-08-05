import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  pin: z.string().min(4, "PIN must be at least 4 digits"),
  role: z.enum(["MANAGER", "MEMBER"]).optional().default("MEMBER"),
});

export const updateMemberSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["MANAGER", "MEMBER"]).optional(),
  active: z.boolean().optional(),
});

export const memberValidation = {
  createMemberSchema,
  updateMemberSchema,
};
