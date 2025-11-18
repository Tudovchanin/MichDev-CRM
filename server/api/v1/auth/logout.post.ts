import {  prismaRefreshTokenRepository } from "~/server/repositories/prisma-repository";


import RefreshTokenService from "~/server/services/RefreshTokenService";
import { clearAuthCookie } from "~/server/utils/cookies";

const refreshTokenService = new RefreshTokenService(prismaRefreshTokenRepository);


export default defineEventHandler(async (e) => {
  try {
    const refreshToken = getCookie(e, 'tokenRefresh');

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);

        if (typeof payload === "object" && payload.sub) {
          await refreshTokenService.deleteToken(payload.sub);
        }
      } catch (err) {
        console.error("Logout error:", err);
      }
    }

    // удаляем refresh token из cookie
    clearAuthCookie(e);

    
    return { message: 'Успешный выход из системы' };

  } catch {
    return { message: 'Успешный выход из системы' };
  }
});  