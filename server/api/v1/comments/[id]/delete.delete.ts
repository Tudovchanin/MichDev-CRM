
import CommentService from "~/server/services/CommentService";
import UserService from "~/server/services/UserService";
import { prismaCommentRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import type { UserBase } from "~/types/shared";
import { CommentBase } from "~/types/backend/commentRepo";


const commentService = new CommentService(prismaCommentRepository);
const userService = new UserService(prismaUserRepository);

export default defineEventHandler(async (e) => {

  const commentId = getRouterParam(e, "id");
  if (!commentId) {
    throw createError({ statusCode: 400, message: "Не указан id коммента" });
  }

  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  assertValidUser(currentUser);
  assertRole(currentUser, ['ADMIN', 'MANAGER', 'CLIENT', 'ADMIN']);

  try {

    const commentDelete:CommentBase = await commentService.deleteComment(commentId, currentUser.id);

    return { comment:commentDelete, message: "Коммент удален" }

  } catch (err) {
    throw err;
  }
});