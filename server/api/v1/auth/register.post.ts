
import UserService from "~/server/services/UserService";
import RefreshTokenService from "~/server/services/RefreshTokenService";
import EmailService from "~/server/services/EmailService";

import { prismaUserRepository, prismaRefreshTokenRepository } from "~/server/repositories/prisma-repository";

import { createAccessToken, createRefreshToken, getTokenExpiryDate } from "~/server/utils/jwt";
import { setAuthCookie } from "~/server/utils/cookies";

import { validateBody } from "~/server/utils/validate";
import { registerSchema } from "~/server/validations/auth";

import type { CreateUserData } from "~/types/backend/userRepo";
import type { UserBase } from "~/types/shared";

const emailService = new EmailService();
const userService = new UserService(prismaUserRepository, emailService);
const refreshTokenService = new RefreshTokenService(prismaRefreshTokenRepository);


export default defineEventHandler(async(e)=> {

  

  const body: CreateUserData = await validateBody(registerSchema, e);;


  try {
    const user:UserBase = await userService.registerUser(body);

    
    const tokenAccess = createAccessToken({ userId: user.id, role: user.role });

    const tokenRefresh = createRefreshToken({ userId: user.id });
    // 7 дней в мс
    const validityPeriodMs = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = getTokenExpiryDate(validityPeriodMs);
    await refreshTokenService.saveToken(user.id, tokenRefresh, expiresAt);
    setAuthCookie(e, tokenRefresh, validityPeriodMs);




    return {
      user,
      tokenAccess,
      tokenExpiresIn: 15 * 60 * 1000
    }
    
  } catch (error) {
      throw error;
  
  }
  

})