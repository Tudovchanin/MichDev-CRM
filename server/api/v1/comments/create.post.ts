
import CommentService from "~/server/services/CommentService";
import UserService from "~/server/services/UserService";
import { prismaCommentRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import type { CreateCommentData, UserBase } from "~/types/shared";
import { validateBody } from "#imports";
import { createCommentBodySchema } from "~/server/validations/comment";


const commentService = new CommentService(prismaCommentRepository);
const userService = new UserService(prismaUserRepository);

export default defineEventHandler(async (e) => {


  const body:CreateCommentData = await validateBody(createCommentBodySchema, e);

 const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

 if (body.authorId !== currentUser.id) throw createError({ statusCode: 403, message: "Ошибка доступа" });
 
  assertValidUser(currentUser);
  assertRole(currentUser, ['ADMIN', 'MANAGER', 'CLIENT', 'ADMIN']);

  try {

  const comment = await commentService.createComment(body);

  return {comment}

    
  } catch (err) {
    throw err;
  }
});