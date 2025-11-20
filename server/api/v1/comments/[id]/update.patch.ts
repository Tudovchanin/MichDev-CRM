
import CommentService from "~/server/services/CommentService";
import UserService from "~/server/services/UserService";
import { prismaCommentRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import type { UserBase, CommentUpdate } from "~/types/shared";
import { validateBody } from "#imports";
import { updateCommentBodySchema } from "~/server/validations/comment";
import { CommentBase } from "~/types/backend/commentRepo";


const commentService = new CommentService(prismaCommentRepository);
const userService = new UserService(prismaUserRepository);

export default defineEventHandler(async (e) => {

  const commentId = getRouterParam(e, "id");
  if (!commentId) {
    throw createError({ statusCode: 400, message: "Не указан id коммента" });
  }

  const body: CommentUpdate = await validateBody(updateCommentBodySchema, e);
  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);


  assertValidUser(currentUser);
  assertRole(currentUser, ['ADMIN', 'MANAGER', 'CLIENT', 'ADMIN']);

  try {

    const commentUpdate:CommentBase = await commentService.updateComment(commentId, body, currentUser.id);

    return { comment:commentUpdate, message: "Коммент обновлен" }

  } catch (err) {
    throw err;
  }
});