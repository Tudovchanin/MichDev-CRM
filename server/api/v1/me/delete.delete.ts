
import UserService from "~/server/services/UserService";

import {
  prismaUserRepository,
} from "~/server/repositories/prisma-repository";


import type { UserBase } from "~/types/shared";



const userService = new UserService(prismaUserRepository);


export default defineEventHandler(async(e)=> {


  const refreshToken = getCookie(e, 'tokenRefresh');

  if (!refreshToken) {
    throw createError({ statusCode: 401, message: 'Отсутствует refresh token' });
  }

  const payload = verifyRefreshToken(refreshToken);

  if (!payload || typeof payload === 'string' || !payload.sub) {
    clearAuthCookie(e);
    throw createError({ statusCode: 401, message: 'Невалидный refresh token' });
  }

  if(payload.sub !== e.context.currentUserPayload.sub) {
    throw createError({ statusCode: 401, message: 'Нет доступа, расхождение токенов' });

  }


  try {

    const currentUser:UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);
    assertValidUser(currentUser);

    await userService.deleteUser(e.context.currentUserPayload.sub);

    return {
      message: `Пользователь с ID ${e.context.currentUserPayload.sub} успешно удалён`

    }

    
  } catch (error) {
    throw error;
  }

})