

import UserService from "~/server/services/UserService";
import RefreshTokenService from "~/server/services/RefreshTokenService";
import EmailService from "~/server/services/EmailService";

import { prismaUserRepository, prismaRefreshTokenRepository } from "~/server/repositories/prisma-repository";

import { createAccessToken, createRefreshToken, getTokenExpiryDate } from "~/server/utils/jwt";

import { setAuthCookie } from "~/server/utils/cookies";

import { validateBody } from "~/server/utils/validateBody";
import { registerSchema } from "~/server/validations/auth";

import type { CreateUserData } from "~/types/backend/userRepo";

const emailService = new EmailService();
const userService = new UserService(prismaUserRepository, emailService);
const refreshTokenService = new RefreshTokenService(prismaRefreshTokenRepository);


export default defineEventHandler(async(e)=> {

  await validateBody(registerSchema, e);
  const body: CreateUserData = e.context.validatedBody;


  try {
    const user = await userService.registerUser(body);

    
    const tokenAccess = createAccessToken({ userId: user.id, role: user.role });

    const tokenRefresh = createRefreshToken({ userId: user.id });
    // 7 дней в мс
    const validityPeriodMs = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = getTokenExpiryDate(validityPeriodMs);
    await refreshTokenService.saveToken(user.id, tokenRefresh, expiresAt);
    setAuthCookie(e, tokenRefresh, validityPeriodMs);




    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role:user.role,
        isEmailConfirmed: user.isEmailConfirmed
      },
      tokenAccess,
      expiresIn: 15 * 60 * 1000
    }
    
  } catch (error) {
    // Если ошибку уже обработали с помощью throw createError
    if (error && typeof error === 'object' && 'statusCode' in error && 'message' in error) {
      throw error;
    }
  
    // Для всех остальных случаев 
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    });
    
  }
  

})