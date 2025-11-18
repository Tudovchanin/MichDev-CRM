import  TaskService  from "~/server/services/TaskService";
import UserService from "~/server/services/UserService";

import type { UserBase, TaskBase } from "~/types/shared";

import { prismaUserRepository, prismaTaskRepository } from "~/server/repositories/prisma-repository";

import { assertRole, assertValidUser } from "~/server/utils/auth";


const userService = new UserService(prismaUserRepository);
const taskService = new TaskService(prismaTaskRepository);

export default defineEventHandler(async (e) => {

  const targetId = getRouterParam(e, "id")!;

  try {
    // Текущий пользователь
    const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  
    assertValidUser(currentUser);
    assertRole(currentUser, 'ADMIN');

    
    // Целевой пользователь
    const targetUser: UserBase = await userService.findByIdBasic(targetId);
    if (!targetUser) throw createError({ statusCode: 404, message: "Целевой пользователь не найден" });

    // Получаем задачи
    const tasks: TaskBase[] = await taskService.getTasksByUser(targetId);

    return { user: targetUser, tasks };

  } catch (error) {
    throw error;
  }
});
