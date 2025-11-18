
import UserService from "~/server/services/UserService";
import { assertRole, assertValidUser } from "~/server/utils/auth";
import { validateQuery } from "~/server/utils/validate"
import { findClientQuerySchema } from "~/server/validations/user";
import {
  prismaUserRepository,
} from "~/server/repositories/prisma-repository";


const userService = new UserService(prismaUserRepository);


export default defineEventHandler(async (e) => {


  try {
    const currentUser = await userService.findByIdBasic(e.context.currentUserPayload.sub);
    // проверка текущего пользователя
    assertValidUser(currentUser);
    assertRole(currentUser, ['ADMIN', 'MANAGER']);
  
    const query = validateQuery(findClientQuerySchema, e);
    const { email, name, isBlocked } = query;
  
    if (!email && !name && !isBlocked) {
      throw createError({ statusCode: 400, message: "Нужно передать хотя бы один параметр запроса для поиска" });
    }
  
  
    const users = await userService.findClientsByCondition({
      email,
      name,
      isBlocked,
    });
  
    return { users };
    
  } catch (error) {
    
  }

});