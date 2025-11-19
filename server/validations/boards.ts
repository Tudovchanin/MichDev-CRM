

import { z } from "zod";

export const queryBoardsSchema = z.object({
  archived: z.string().optional(), // 'true' | 'false'
});



export const createBoardSchema = z.object({
  name: z.string().min(1, "Название доски обязательно"),
  clientEmail: z.string().pipe(z.email("Неверный email клиента")),
  managerId: z.string().nullable().optional(), // для ADMIN
});


export const updateBoardSchema = z.object({
  name: z.string().min(1, "Название слишком короткое").optional(),

  clientEmail: z.string().pipe(z.email("Неверный email клиента")).optional(),

  clientId: z.string().nullable().optional(),

  managerId: z.string().nullable().optional(),

  isArchived: z.boolean().optional(),
});