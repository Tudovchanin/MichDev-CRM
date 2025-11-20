
import BoardService from "~/server/services/BoardService";
import CommentService from "~/server/services/CommentService";
import UserService from "~/server/services/UserService";
import TaskService from "~/server/services/TaskService";
import { prismaCommentRepository, prismaUserRepository, prismaBoardRepository, prismaTaskRepository } from "~/server/repositories/prisma-repository";
import type { UserBase } from "~/types/shared";
import { CommentBase } from "~/types/backend/commentRepo";

const boardService = new BoardService(prismaBoardRepository);
const commentService = new CommentService(prismaCommentRepository);
const userService = new UserService(prismaUserRepository);
const taskService = new TaskService(prismaTaskRepository, boardService);

export default defineEventHandler(async (e) => {

  const taskId = getRouterParam(e, "id");
  if (!taskId) {
    throw createError({ statusCode: 400, message: "Не указан id задачи" });
  }
  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);
  assertValidUser(currentUser);
  assertRole(currentUser, ['ADMIN', 'MANAGER', 'CLIENT', 'EXECUTOR']);

  try {


    const comments:CommentBase[] = await commentService.getCommentsByTask(taskId);
    
    if(comments.length === 0) {
      return {
          comments
      }
    } 

        // проверка доступа к доске, выкинет ошибку если нет

    await boardService.getBoardByIdForUser(currentUser.id, currentUser.role, comments[0].boardId);

    // проверяем исполнителя, доступ есть только к комментам назначенных задач
    if (currentUser.role === 'EXECUTOR' && comments[0].taskId) {
      const task = await taskService.getTaskById(taskId);
      if(task.assignedToId !== currentUser.id)  throw createError({ statusCode: 403, message: "Нет доступа к комментариям" });
    }

    return { comments }

  } catch (err) {
    throw err;
  }
});