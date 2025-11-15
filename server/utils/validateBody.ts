import { z } from 'zod';
import type { ZodType } from 'zod';
/**
 * validateBodyForEvent - проверяет body запроса по схеме Zod
 * и сохраняет валидированные данные в event.context.validatedBody
 * 
 * @param schema ZodType - Zod-схема для проверки
 * @param event - объект запроса Nuxt 3
 */
export const validateBody = async (schema: ZodType<any>, event: any) => {
  // 1️⃣ Считываем body запроса
  const bodyRaw = await readBody(event);

  // 2️⃣ Проверяем body по переданной схеме
  const result = schema.safeParse(bodyRaw);

  // 3️⃣ Если данные не валидны, выбрасываем 400 ошибку с деталями
  if (!result.success) {
    const formattedError = z.treeifyError(result.error);

    throw createError({
      statusCode: 400,
      statusMessage: "Неверные данные",
      data: formattedError,
    });
  }

  // 4️⃣ Сохраняем валидированные данные в контекст для последующего использования
  event.context.validatedBody = result.data;
};
