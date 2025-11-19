import UserService from "~/server/services/UserService";

import { prismaUserRepository } from "~/server/repositories/prisma-repository";
import {  assertValidUser, assertRole } from "~/server/utils/auth";

import { changeUserRoleSchema } from "~/server/validations/user";
import type { Role, UserBase } from "~/types/shared";

const userService = new UserService(prismaUserRepository);

export default defineEventHandler(async (e) => {
  
  const targetId = getRouterParam(e, "id");
  if (!targetId) {
    throw createError({ statusCode: 400, message: "Не указан id пользователя" });
  }

  try {
    const currentUser = await userService.findByIdBasic(
      e.context.currentUserPayload.sub
    );

    assertValidUser(currentUser);
    assertRole(currentUser, ['ADMIN', 'MANAGER']);


    const body: { role: Role } = await validateBody(changeUserRoleSchema, e);

    // Получаем пользователя, чью роль будем менять
    const targetUser: UserBase = await userService.findByIdBasic(targetId);
    if (!targetUser)
      throw createError({
        statusCode: 404,
        message: "Целевой пользователь не найден",
      });

    // Админ может менять любую роль
    if (currentUser.role === "ADMIN") {
      const updated: UserBase = await userService.changeRole(
        targetId,
        body.role
      );
      return {
        user: updated,
        message: `Роль пользователя ${updated.name} успешно изменена на ${updated.role}`,
      };
    }

    // Менеджер может менять только клиентов → исполнителей
    if (currentUser.role === "MANAGER") {
      if (targetUser.role !== "CLIENT") {
        throw createError({
          statusCode: 403,
          message: "Менеджер может менять роль только клиентов",
        });
      }
      if (body.role !== "EXECUTOR") {
        throw createError({
          statusCode: 403,
          message: "Менеджер может повысить клиента только до исполнителя",
        });
      }
      const updated: UserBase = await userService.changeRole(
        targetId,
        body.role
      );
      return {
        user: updated,
        message: `Роль пользователя ${updated.name} успешно изменена на ${updated.role}`,
      };
    }
    throw createError({
      statusCode: 403,
      message: "Неизвестная роль пользователя",
    });


    
  } catch (error) {
    throw error;
  }
});
