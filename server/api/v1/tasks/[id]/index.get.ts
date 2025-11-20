

import { getRouterParam } from "#imports";
import TaskService from "~/server/services/TaskService";
import BoardService from "~/server/services/BoardService";
import UserService from "~/server/services/UserService";
import { prismaTaskRepository, prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import { assertValidUser} from "#imports";

const boardService = new BoardService(prismaBoardRepository);
const taskService = new TaskService(prismaTaskRepository, boardService);
const userService = new UserService(prismaUserRepository);

export default defineEventHandler(async (e) => {
  const taskId = getRouterParam(e, "id");
  if (!taskId) {
    throw createError({ statusCode: 400, message: "Не указан id задачи" });
  }

  const currentUser = await userService.findByIdBasic(e.context.currentUserPayload.sub);
  assertValidUser(currentUser);



  try {

  const task = await taskService.getTaskByIdForUser(taskId, currentUser);
  

  return { task };
    
  } catch (err) {
    throw(err)
  }



});
