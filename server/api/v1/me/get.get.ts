
import UserService from "~/server/services/UserService";

import {
  prismaUserRepository,
} from "~/server/repositories/prisma-repository";

import type { UserBase } from "~/types/shared";

const userService = new UserService(prismaUserRepository);


export default defineEventHandler(async(e)=> {


  try {

    const currentUser:UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);
    assertValidUser(currentUser);

    return {
      user: currentUser
    }

    
  } catch (error) {
    throw error;
  }

})