
import UserService from "~/server/services/UserService";
import {
  prismaUserRepository,
} from "~/server/repositories/prisma-repository";
import { assertRole, assertValidUser } from "~/server/utils/auth";
import type { UserBase } from "~/types/shared";


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

    const blockedUser: UserBase = await userService.blockUser(targetId);

    
    return {
      user: blockedUser,
      message: `Пользователь ${blockedUser.name} заблокирован`
    }

  } catch (error) {
    throw error;
  }


})