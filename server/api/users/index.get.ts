
import UserService from "~/server/services/UserService";

import { prismaUserRepository } from "~/server/repositories/prisma-repository";

import { getAccessToken } from '~/server/utils/auth';



const userService = new UserService(prismaUserRepository);



export default defineEventHandler (async(e)=> {


  try {
    const accessToken = getAccessToken(e);
    const payload= verifyAccessToken(accessToken);

    console.log(payload, 'payload');
    


    const users = await userService.getAllUsers();

    console.log(users);
    
    return {
      users
    }
    
  } catch (error) {
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