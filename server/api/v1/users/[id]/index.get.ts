
import UserService from "~/server/services/UserService";

import {
  prismaUserRepository,
} from "~/server/repositories/prisma-repository";

import type { UserResponseCounts } from "~/types/shared";

import { assertRole, assertValidUser } from "~/server/utils/auth";


const userService = new UserService(prismaUserRepository);



export default defineEventHandler(async (e) => {

  const targetId= getRouterParam(e, 'id');
  if (!targetId) {
    throw createError({ statusCode: 400, message: "Не указан id пользователя" });
  }

  try {

    const currentUser:UserResponseCounts = await userService.findByIdWithCounts(e.context.currentUserPayload.sub);

    assertValidUser(currentUser);
    assertRole(currentUser, ['ADMIN', 'MANAGER']);
    

    const targetUser:UserResponseCounts = await userService.findByIdWithCounts(targetId);

    if (!targetUser) {
      throw createError({ statusCode: 404, message: 'Пользователь не найден' });
    }


    if (currentUser.role === 'ADMIN') {
      return {
        user: targetUser
      }
    } else if (currentUser.role === 'MANAGER' && (targetUser.role === 'CLIENT' || targetUser.role === 'EXECUTOR')) {
      return {
        user: targetUser
      }
    } else {
      throw createError({ statusCode: 403, message: "У вас нет прав для просмотра этого пользователя" })
    }

  } catch (error) {
    throw error;
  }


})