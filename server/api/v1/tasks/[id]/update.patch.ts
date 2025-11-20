
import { updateTaskSchema } from "~/server/validations/task";
import TaskService from "~/server/services/TaskService";
import BoardService from "~/server/services/BoardService";
import UserService from "~/server/services/UserService";
import { prismaTaskRepository, prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import { validateBody, assertValidUser, assertRole } from "#imports";


const boardService = new BoardService(prismaBoardRepository);
const taskService = new TaskService(prismaTaskRepository, boardService);
const userService = new UserService(prismaUserRepository);


export default defineEventHandler(async (e) => {
  const taskId = getRouterParam(e, 'id');

  if (!taskId) {
    throw createError({ statusCode: 400, message: "Не указан id доски" });
  }

  const currentUser = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  assertValidUser(currentUser);
  assertRole(currentUser, ["ADMIN", "MANAGER", 'CLIENT']);

  const body = await validateBody(updateTaskSchema, e);

  try {

    const updatedTask = await taskService.updateTask(body, currentUser, taskId);

    return { task: updatedTask };

  } catch (err) {
    throw err;
  }
});