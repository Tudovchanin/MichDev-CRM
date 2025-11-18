import UserService from "~/server/services/UserService";
import RefreshTokenService from "~/server/services/RefreshTokenService";
import {
  prismaUserRepository,
  prismaRefreshTokenRepository,
} from "~/server/repositories/prisma-repository";

import { createAccessToken, getTokenExpiryDate } from "~/server/utils/jwt";
import { validateBody } from "~/server/utils/validate";
import { setAuthCookie } from "~/server/utils/cookies";
import { loginSchema } from "~/server/validations/auth";

import type { AuthenticateUserData, UserWithPassword } from "~/types/backend/userRepo";
import type { UserBase } from "~/types/shared";

const userService = new UserService(prismaUserRepository);
const refreshTokenService = new RefreshTokenService(
  prismaRefreshTokenRepository
);

export default defineEventHandler(async (e) => {

  const body: AuthenticateUserData = await validateBody(loginSchema, e);

  try {
    const user: UserWithPassword = await userService.loginUser(body);

    const tokenAccess = createAccessToken({ userId: user.id, role: user.role });

    const tokenRefresh = createRefreshToken({ userId: user.id });
    // 7 дней в мс
    const validityPeriodMs = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = getTokenExpiryDate(validityPeriodMs);
    await refreshTokenService.saveToken(user.id, tokenRefresh, expiresAt);

    setAuthCookie(e, tokenRefresh, validityPeriodMs);

    const userNoPassword:UserBase = userService.mapUserBase(user); 



    return {
      user:userNoPassword,
      tokenAccess,
      tokenExpiresIn: 15 * 60 * 1000,
    };
  } catch (error) {
    throw error;
  }
});
