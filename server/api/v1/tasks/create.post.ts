import TaskService from "~/server/services/TaskService";
import BoardService from "~/server/services/BoardService";
import UserService from "~/server/services/UserService";
import NotificationService from "~/server/services/NotificationService";
import { prismaTaskRepository, prismaBoardRepository, prismaUserRepository, prismaNotificationRepository } from "~/server/repositories/prisma-repository";
import { assertValidUser, assertRole, validateBody } from "#imports";
import { createTaskBodySchema } from "~/server/validations/task";
import type { TaskBase, UserBase } from "~/types/shared";


const boardService = new BoardService(prismaBoardRepository);
const taskService = new TaskService(prismaTaskRepository, boardService);
const userService = new UserService(prismaUserRepository);
const notificationService = new NotificationService(prismaNotificationRepository);


export default defineEventHandler(async(e)=> {

  const body = await validateBody(createTaskBodySchema, e);
  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  assertValidUser(currentUser);
  assertRole(currentUser, ['ADMIN', 'MANAGER']);


  try {
  const task: TaskBase = await taskService.createTask(body, currentUser);

  // уведомление исполнителя, менеджера
  await notificationService.notifyAddedToTheTask(task, currentUser.role as 'ADMIN'| 'MANAGER' , currentUser.id);

  return { task };
    
  } catch (err) {
    throw err;
  }
})