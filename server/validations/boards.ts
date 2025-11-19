

import { z } from "zod";

export const queryBoardsSchema = z.object({
  archived: z.string().optional(), // 'true' | 'false'
});