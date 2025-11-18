
import UserService from "~/server/services/UserService";

import { prismaUserRepository } from "~/server/repositories/prisma-repository";
import { UserBase } from "~/types/shared";

import { assertRole, assertValidUser } from "~/server/utils/auth";


const userService = new UserService(prismaUserRepository);



export default defineEventHandler(async(e)=> {



  const currentId = e.context.currentUserPayload.sub;


  try {

    const currentUser:UserBase = await userService.findByIdBasic(currentId);

    assertValidUser(currentUser);
    assertRole(currentUser, 'ADMIN');


    const deleteUserId = getRouterParam(e, "id");

    if (!deleteUserId) throw createError({ statusCode: 400, message: 'Не указан ID пользователя' });

      await userService.deleteUser(deleteUserId);


    return {
      message: `Пользователь с ID ${deleteUserId} успешно удалён`
    }
    
  } catch (error) {
    throw error;
  }
})