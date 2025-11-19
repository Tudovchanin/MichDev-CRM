// server/api/boards/[id]/tasks.get.ts
import TaskService from "~/server/services/TaskService";
import BoardService from "~/server/services/BoardService";
import { prismaTaskRepository, prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import UserService from "~/server/services/UserService";
import { assertValidUser, assertRole } from "#imports";
import { validateQuery } from "#imports";
import { taskFiltersQuerySchema } from "~/server/validations/task";
import type { TaskFilters, UserBase } from "~/types/shared";

const boardService = new BoardService(prismaBoardRepository);
const taskService = new TaskService(prismaTaskRepository, boardService);
const userService = new UserService(prismaUserRepository);

export default defineEventHandler(async (e) => {
  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  // Проверяем пользователя
  assertValidUser(currentUser);

  // Проверяем роль: кто может видеть задачи доски
  assertRole(currentUser, ["ADMIN", "MANAGER", "CLIENT", "EXECUTOR"]);

  const boardId = getRouterParam(e, "id");
  if (!boardId) {
    throw createError({ statusCode: 400, message: "Не указан id доски" });
  }

  // Фильтры можно передавать через query параметры
  const filtersQuery = validateQuery(taskFiltersQuerySchema, e);

  const filters: TaskFilters = {
    status: filtersQuery.status as TaskFilters["status"],
    assignedToId: filtersQuery.assignedToId,
    deadline: filtersQuery.deadline ? new Date(filtersQuery.deadline) : undefined,
  };

  try {
    const tasks = await taskService.getTasksByBoard(boardId, currentUser, filters);
    return { tasks };
  } catch (err) {
    throw err;
  }
});
