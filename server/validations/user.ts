

import { z } from "zod";


export const roleSchema = z.enum(["ADMIN", "MANAGER", "EXECUTOR", "CLIENT"]);

export const changeUserRoleSchema = z.object({
  role: roleSchema,
});

export const findClientQuerySchema = z.object({
  email: z.string().trim().pipe(z.email()).optional(),
  name: z.string().trim().min(1).optional(),
  isBlocked: z.enum(["true", "false"]).optional(),
});