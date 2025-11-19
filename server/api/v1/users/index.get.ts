
import UserService from "~/server/services/UserService";

import { prismaUserRepository } from "~/server/repositories/prisma-repository";
import type { UserBase, UserResponseCounts } from "~/types/shared";

import { assertValidUser } from "~/server/utils/auth";


const userService = new UserService(prismaUserRepository);


export default defineEventHandler(async (e) => {

  const userId = e.context.currentUserPayload.sub;

  try {

    const currentUser: UserBase = await userService.findByIdBasic(userId);

    assertValidUser(currentUser);

    let users: UserResponseCounts[] | UserBase[];

    switch (currentUser.role) {
      case 'ADMIN':
        users = await userService.findUsers();
        break;

      case 'MANAGER':
        users = await userService.findUsers(['CLIENT', 'EXECUTOR']);
        break;

      case 'EXECUTOR':
      case 'CLIENT':
        users = [currentUser];
        break;

      default:
        throw createError({ statusCode: 500, message: "Неизвестная роль" });
    }

    return { users };

  } catch (error) {

    throw error;

  }

})