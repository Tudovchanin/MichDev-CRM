


// server/validation/task.ts
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(["NEW", "IN_PROGRESS", "REVISION", "REVIEW", "DONE"]),
  order: z.number().optional(),
  assignedToId: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string(),
});
