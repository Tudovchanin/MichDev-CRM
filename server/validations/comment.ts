import { z } from "zod";

// Для POST /comments
export const createCommentBodySchema = z.object({
  text: z.string().min(1, "Комментарий не может быть пустым"),
  authorId: z.string().pipe(z.cuid()),
  boardId: z.string().pipe(z.cuid()),
  taskId: z.string().pipe(z.cuid()).optional().nullable(),
});

// Для PATCH /comments/:id
export const updateCommentBodySchema = z.object({
  text: z.string().min(1, "Комментарий не может быть пустым").optional(),
});

// Для GET /comments с фильтрацией и пагинацией
export const commentFiltersQuerySchema = z.object({
  boardId: z.string().pipe(z.cuid()).optional(),
  taskId: z.string().pipe(z.cuid()).optional(),
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

export type CreateCommentBodyServer = z.infer<typeof createCommentBodySchema>;
export type UpdateCommentBodyServer = z.infer<typeof updateCommentBodySchema>;
export type CommentFiltersQueryServer = z.infer<typeof commentFiltersQuerySchema>;
