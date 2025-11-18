
import { z } from "zod";


export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  avatar: z.string().trim().pipe(z.url()).optional(),
  email: z.string().trim().pipe(z.email()).optional(),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().trim().min(6),
  newPassword: z.string().trim().min(6),
});