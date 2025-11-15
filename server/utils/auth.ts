


import type { H3Event } from 'h3';



export function getAccessToken(e: H3Event): string {
  const authorization = getRequestHeader(e, "authorization");
  
  if (!authorization) {
    throw createError({
      statusCode: 401,
      message: "Требуется авторизация",
    });
  }

  if (!authorization.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      message: "Неверный формат авторизации",
    });
  }

  return authorization.slice(7);
}