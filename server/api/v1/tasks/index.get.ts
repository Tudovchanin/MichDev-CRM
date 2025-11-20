// server/api/v1/tasks/index.get.ts
import TaskService from "~/server/services/TaskService";
import BoardService from "~/server/services/BoardService";
import UserService from "~/server/services/UserService";
import { prismaTaskRepository, prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import { assertValidUser, assertRole, validateQuery } from "#imports";
import { taskFiltersQuerySchema } from "~/server/validations/task";

import type { UserBase, TaskFilters, TaskBase, PaginationOptions } from "~/types/shared";



const boardService = new BoardService(prismaBoardRepository);
const taskService = new TaskService(prismaTaskRepository, boardService);
const userService = new UserService(prismaUserRepository);

export default defineEventHandler(async (e) => {


  // Валидируем query params для фильтров
  const filtersQuery = validateQuery(taskFiltersQuerySchema, e);



  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  // Проверяем пользователя
  assertValidUser(currentUser);

  // Роли, кто может видеть задачи
  assertRole(currentUser, ["ADMIN", "MANAGER", "CLIENT", "EXECUTOR"]);


 // Формируем фильтры
 const filters: TaskFilters & PaginationOptions = {
  status: filtersQuery.status as TaskFilters["status"],
  assignedToId: filtersQuery.assignedToId,
  responsibleId: filtersQuery.responsibleId, // если добавил поддержку responsibleId в query
  boardId: filtersQuery.boardId,
  skip: filtersQuery.skip,
  take: filtersQuery.take,
};


  try {
     // Получаем задачи через сервис
  const tasks: TaskBase[] = await taskService.getTasksForUser(currentUser, filters);
  return { tasks };


  } catch (err) {
    throw err;

  }

  });
