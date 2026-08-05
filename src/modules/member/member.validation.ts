import { z } from "zod";

export const createMemberSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().optional(),
    pin: z.string().min(4, "PIN must be at least 4 digits"),
    role: z.enum(["SUPER_ADMIN", "MANAGER", "MEMBER"]).optional().default("MEMBER"),
  }),
});

export const updateMemberSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().optional(),
    role: z.enum(["SUPER_ADMIN", "MANAGER", "MEMBER"]).optional(),
    active: z.boolean().optional(),
  }),
});

export const memberValidation = {
  createMemberSchema,
  updateMemberSchema,
};
