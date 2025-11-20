
import UserService from "~/server/services/UserService";
import { prismaUserRepository } from "~/server/repositories/prisma-repository";
import { verifyRefreshToken } from "~/server/utils/jwt";
import { assertValidUser } from "#imports";
import { updateProfileSchema } from "~/server/validations/me";
import { validateBody } from "#imports";
import type { UserBase } from "~/types/shared";
import { UpdateUserData } from "~/types/backend/userRepo";


const userService = new UserService(prismaUserRepository);

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

  if (payload.sub !== e.context.currentUserPayload.sub) {
    throw createError({ statusCode: 401, message: 'Нет доступа, расхождение токенов' });
  }

  const body = await validateBody(updateProfileSchema, e);


  try {

    const currentUser: UserBase = await userService.findByIdBasic(payload.sub);
    assertValidUser(currentUser);

    const updateData:UpdateUserData = body;

    const updated = await userService.updateProfile(payload.sub, updateData);

    return {
      message: "Профиль обновлен",
      user: updated
    };
  } catch (error) {
    throw error;
  }
});
