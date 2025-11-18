
import { z } from 'zod';
import type { ZodType } from 'zod';
import type { H3Event } from 'h3';

// validateBody для валидации body
export const validateBody = async (schema: ZodType<any>, e:H3Event) => {

  const bodyRaw = await readBody(e);

  // Проверяем body по переданной схеме
  const result = schema.safeParse(bodyRaw);

  // Если данные не валидны, выбрасываем 400 ошибку с деталями
  if (!result.success) {
    const formattedError = z.treeifyError(result.error);

    throw createError({
      statusCode: 400,
      statusMessage: "Неверные данные в теле запроса",
      data: formattedError,
    });
  }

  // Возвращаем валидные данные
  return result.data;
};

// validateQuery — для GET query params
export const validateQuery = (schema: ZodType<any>, e: H3Event) => {

  const query = getQuery(e);
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