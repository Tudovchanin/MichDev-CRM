import TaskService from "~/server/services/TaskService";
import BoardService from "~/server/services/BoardService";
import UserService from "~/server/services/UserService";
import { prismaTaskRepository, prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import { assertValidUser, assertRole, validateBody } from "#imports";
import { createTaskBodySchema } from "~/server/validations/task";
import type { TaskBase, UserBase } from "~/types/shared";


const boardService = new BoardService(prismaBoardRepository);
const taskService = new TaskService(prismaTaskRepository, boardService);
const userService = new UserService(prismaUserRepository);


export default defineEventHandler(async(e)=> {

  const body = await validateBody(createTaskBodySchema, e);
  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  assertValidUser(currentUser);
  assertRole(currentUser, ['ADMIN', 'MANAGER']);


  try {


  const task: TaskBase = await taskService.createTask(body, currentUser);
  return { task };
    
  } catch (err) {
    throw err;
  }
})