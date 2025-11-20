
import { z } from 'zod';
import type { ZodType } from 'zod';
import type { H3Event } from 'h3';

// validateBody для валидации body
export const validateBody = async <T>(schema: ZodType<T>, e: H3Event): Promise<T> => {
  const bodyRaw = await readBody(e);
  const result = schema.safeParse(bodyRaw);

  if (!result.success) {
    const formattedError = z.treeifyError(result.error);
    throw createError({
      statusCode: 400,
      statusMessage: "Неверные данные в теле запроса",
      data: formattedError,
    });
  }

  return result.data;
};


// validateQuery — для GET query params
export const validateQuery = <T>(schema: ZodType<T>, e: H3Event): T => {
  const query = getQuery(e); // query params
  const result = schema.safeParse(query);

  if (!result.success) {
    const formattedError = z.treeifyError(result.error);
    throw createError({
      statusCode: 400,
      statusMessage: "Неверные данные в query params",
      data: formattedError,
    });
  }

  return result.data;
};