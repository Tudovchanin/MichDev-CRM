


import { getRouterParam } from "#imports";
import TaskService from "~/server/services/TaskService";
import BoardService from "~/server/services/BoardService";
import UserService from "~/server/services/UserService";
import { prismaTaskRepository, prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import { assertValidUser} from "#imports";
import type { UserBase,  TaskBaseMinimal } from "~/types/shared";


const boardService = new BoardService(prismaBoardRepository);
const taskService = new TaskService(prismaTaskRepository, boardService);
const userService = new UserService(prismaUserRepository);


export default defineEventHandler(async (e) => {

  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  assertValidUser(currentUser);
  assertRole(currentUser, ["ADMIN"]);

  const taskId = getRouterParam(e, "id");
  if (!taskId) {
    throw createError({ statusCode: 400, message: "Не указан id доски" });
  }

  try {
    const deletedTask:TaskBaseMinimal = await taskService.deleteTask(taskId);
    return {
      board: deletedTask,
      message: `Задача ${deletedTask.title} доски ${deletedTask.boardId}  удалена`
    };
  } catch (err) {
    throw err;
  }
});
