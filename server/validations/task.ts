import { z } from "zod";

export const createTaskBodySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z
    .enum(["NEW", "IN_PROGRESS", "REVISION", "REVIEW", "DONE"])
    .optional(),
  boardId: z.string().pipe(z.cuid()),
  assignedToId: z.string().pipe(z.cuid()).optional().nullable(),
  responsibleId: z.string().pipe(z.cuid()).optional().nullable(),
  order: z.preprocess(
    (val) => (val != null ? Number(val) : undefined),
    z.number().int().optional()
  ),

  // дедлайн может быть не задан
  deadline: z.preprocess((val) => {
    if (!val) return null; // undefined, null, пустая строка → null
    return new Date(val as string);
  }, z.date().nullable()),
});

export const taskFiltersQuerySchema = z.object({
  status: z
    .string()
    .pipe(z.enum(["NEW", "IN_PROGRESS", "REVISION", "REVIEW", "DONE"]))
    .optional(),
  assignedToId: z.string().pipe(z.cuid()).optional(),
  responsibleId: z.string().pipe(z.cuid()).optional(),
  boardId: z.string().pipe(z.cuid()).optional(),
  skip: z
    .string()
    .optional()
    .transform((s) => {
      const n = Number(s ?? 0);
      return isNaN(n) ? 0 : n;
    }),
  take: z
    .string()
    .optional()
    .transform((s) => {
      const n = Number(s ?? 20);
      return isNaN(n) ? 20 : n;
    }),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["NEW", "IN_PROGRESS", "DONE"]).optional(),
  assignedToId: z.string().pipe(z.cuid()).optional().nullable(),
  responsibleId: z.string().pipe(z.cuid()).optional().nullable(),
  order: z.preprocess(
    (val) => (val != null ? Number(val) : undefined),
    z.number().int().optional()
  ),
  deadline: z.preprocess((val) => {
    if (!val) return null; // undefined, null, пустая строка → null
    return new Date(val as string);
  }, z.date().nullable()),
});

export type CreateTaskBodyServer = z.infer<typeof createTaskBodySchema>;

export type UpdateTaskBodyServer = z.infer<typeof updateTaskSchema>;
