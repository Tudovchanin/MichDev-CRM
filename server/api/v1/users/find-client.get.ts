
import UserService from "~/server/services/UserService";
import {  assertValidUser, assertRole } from "~/server/utils/auth";

import { validateQuery } from "~/server/utils/validate"
import { findClientQuerySchema } from "~/server/validations/user";

import {
  prismaUserRepository,
} from "~/server/repositories/prisma-repository";
import { UserBase } from "~/types/shared";

const userService = new UserService(prismaUserRepository);


export default defineEventHandler(async (e) => {


  try {
    const currentUser = await userService.findByIdBasic(e.context.currentUserPayload.sub);
    assertRole(currentUser, ['ADMIN', 'MANAGER']);
  
    const query = validateQuery(findClientQuerySchema, e);
    const { email, name, isBlocked } = query;
  
    if (!email && !name && !isBlocked) {
      throw createError({ statusCode: 400, message: "Нужно передать хотя бы один параметр для поиска" });
    }
  
    // Собираем условие для поиска
    const where: any = { role: 'CLIENT' }; // ищем только клиентов
    if (email) where.email = email;
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (isBlocked !== undefined) where.isBlocked = isBlocked === 'true';
  
    // Выполняем поиск
    const users = await userService.findClientsByCondition({
      email: query.email,
      name: query.name,
      isBlocked: query.isBlocked ? query.isBlocked === "true" : undefined,
    });
  
    return { users };
    
  } catch (error) {
    
  }

});