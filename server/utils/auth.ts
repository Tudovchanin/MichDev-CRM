


import type { H3Event } from 'h3';
import type { UserBase, Role } from "~/types/shared";



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



export function assertValidUser(user: UserBase) {
  if (!user) throw createError({ statusCode: 404, message: "Пользователь не найден" });
  if (user.isBlocked) throw createError({ statusCode: 403, message: "Аккаунт заблокирован" });
  if (!user.isEmailConfirmed) throw createError({ statusCode: 403, message: "Email не активирован" });
}

export function assertRole(user: UserBase, role: Role | Role[]) {
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) throw createError({ statusCode: 403, message: "Нет прав" });
}
