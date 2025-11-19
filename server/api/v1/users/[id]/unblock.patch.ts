import UserService from "~/server/services/UserService";

import {
  prismaUserRepository,
} from "~/server/repositories/prisma-repository";

import type { UserBase } from "~/types/shared";
import { assertRole, assertValidUser } from "~/server/utils/auth";


const userService = new UserService(prismaUserRepository);


export default defineEventHandler(async (e) => {

  const targetId = getRouterParam(e, 'id');

  if (!targetId) {
    throw createError({ statusCode: 400, message: "Не указан id пользователя" });
  }

  try {

    const currentUser:UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);


    assertValidUser(currentUser);
    assertRole(currentUser, 'ADMIN');

    const unBlockedUser: UserBase = await userService.unblockUser(targetId);

    
    return {
      user: unBlockedUser,
      message: `Пользователь ${unBlockedUser.name} разблокирован`
    }

  } catch (error) {
    throw error;
  }


})