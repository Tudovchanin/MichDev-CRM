import UserService from "~/server/services/UserService";
import RefreshTokenService from "~/server/services/RefreshTokenService";

import { prismaUserRepository, prismaRefreshTokenRepository } from "~/server/repositories/prisma-repository";
import { createAccessToken } from "#imports";

import type { UserBase } from "~/types/shared";

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

    const currentUser:UserBase = await userService.findByIdBasic(payload.sub);

    if (!currentUser) {
      clearAuthCookie(e);
      throw createError({ statusCode: 404, message: 'Пользователь не найден' })
    }

    if (currentUser.isBlocked) {
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

    const tokenAccess = createAccessToken({ userId: currentUser.id, role: currentUser.role });


    return {
      user:currentUser,
      tokenAccess,
      tokenExpiresIn: 15 * 60 * 1000,
    }


  } catch (error) {

    throw error;
  }

})