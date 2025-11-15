import UserService from "~/server/services/UserService";
import RefreshTokenService from "~/server/services/RefreshTokenService";

import { prismaUserRepository, prismaRefreshTokenRepository } from "~/server/repositories/prisma-repository";
import { createAccessToken } from "#imports";

const userService = new UserService(prismaUserRepository)
const refreshTokenService = new RefreshTokenService(prismaRefreshTokenRepository);

import { clearAuthCookie } from "~/server/utils/cookies";

export default defineEventHandler(async (e) => {

  const refreshToken = getCookie(e, 'tokenRefresh');

  if (!refreshToken) {
    throw createError({ statusCode: 401, message: 'Отсутствует refresh token' });
  }
  const payload = verifyRefreshToken(refreshToken);

  if (!payload || typeof payload === 'string' || !payload.sub) {
    clearAuthCookie(e);
    throw createError({ statusCode: 401, message: 'Невалидный refresh token' });
  }

  try {

    const user = await userService.getUserById(payload.sub);

    if (!user) {
      clearAuthCookie(e);
      throw createError({ statusCode: 404, message: 'Пользователь не найден' })
    }

    if (user.isBlocked) {
      clearAuthCookie(e);
      throw createError({ statusCode: 401, message: 'Пользователь заблокирован' })
    }

    const dbTokenRefresh = await refreshTokenService.getToken(payload.sub);
    if (!dbTokenRefresh) {
      clearAuthCookie(e);
      throw createError({ statusCode: 401, message: 'Отсутствует токен обновления' })
    }

    if (dbTokenRefresh.token !== refreshToken) {
      clearAuthCookie(e);
      throw createError({ statusCode: 401, message: 'Невалидный токен' })
    }

    const newAccessToken = createAccessToken({ userId: user.id, role: user.role });

    return {
      newAccessToken
    }


  } catch (error) {

    throw error;
  }

})