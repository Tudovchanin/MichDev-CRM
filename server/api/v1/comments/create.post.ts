
import CommentService from "~/server/services/CommentService";
import UserService from "~/server/services/UserService";
import NotificationService from "~/server/services/NotificationService";
import TaskService from "~/server/services/TaskService";
import { prismaCommentRepository, prismaUserRepository, prismaNotificationRepository, prismaTaskRepository } from "~/server/repositories/prisma-repository";
import type { CreateCommentData, TaskBase, UserBase } from "~/types/shared";
import { validateBody } from "#imports";
import { createCommentBodySchema } from "~/server/validations/comment";
import { CommentBase } from "~/types/backend/commentRepo";

const notificationService = new NotificationService(prismaNotificationRepository);
const commentService = new CommentService(prismaCommentRepository);
const userService = new UserService(prismaUserRepository);
const taskService = new TaskService(prismaTaskRepository);


export default defineEventHandler(async (e) => {


  const body:CreateCommentData = await validateBody(createCommentBodySchema, e);

 const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

 if (body.authorId !== currentUser.id) throw createError({ statusCode: 403, message: "Ошибка доступа" });
 
  assertValidUser(currentUser);
  assertRole(currentUser, ['ADMIN', 'MANAGER', 'CLIENT', 'ADMIN']);

  try {

  const comment:CommentBase = await commentService.createComment(body);


  if(comment.taskId) {
    const task:TaskBase = await taskService.getTaskById(comment.taskId);
   
    await notificationService.notifyNewComment(task, comment, currentUser);

  }

  return {comment}

    
  } catch (err) {
    throw err;
  }
});